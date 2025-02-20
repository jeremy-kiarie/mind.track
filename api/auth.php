<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

class Auth {
    private $conn;
    private $max_attempts = 5;
    private $lockout_duration = 1800; // 30 minutes in seconds
    
    public function __construct($db) {
        $this->conn = $db;
    }

    public function register($username, $email, $password, $security_word) {
        try {
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            $security_word_hash = password_hash($security_word, PASSWORD_DEFAULT);
            
            $query = "INSERT INTO users (username, email, password_hash, security_word) 
                     VALUES (:username, :email, :password_hash, :security_word)";
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":username", $username);
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":password_hash", $password_hash);
            $stmt->bindParam(":security_word", $security_word_hash);
            
            if($stmt->execute()) {
                return [
                    "success" => true,
                    "user_id" => $this->conn->lastInsertId()
                ];
            }
            
            return ["success" => false, "message" => "Registration failed"];
            
        } catch(PDOException $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function login($email, $password, $security_word = null) {
        try {
            $query = "SELECT * FROM users WHERE email = :email";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":email", $email);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Check if account is locked
                if($user['locked_until'] !== null && strtotime($user['locked_until']) > time()) {
                    return [
                        "success" => false, 
                        "message" => "Account is locked. Please use your security word.",
                        "locked" => true
                    ];
                }
                
                // If security word is provided, verify it
                if($security_word !== null) {
                    if(password_verify($security_word, $user['security_word'])) {
                        // Reset login attempts and unlock account
                        $this->resetLoginAttempts($user['id']);
                        return [
                            "success" => true,
                            "user_id" => $user['id'],
                            "username" => $user['username']
                        ];
                    }
                    return ["success" => false, "message" => "Invalid security word"];
                }
                
                // Normal password login
                if(password_verify($password, $user['password_hash'])) {
                    $this->resetLoginAttempts($user['id']);
                    return [
                        "success" => true,
                        "user_id" => $user['id'],
                        "username" => $user['username']
                    ];
                }
                
                // Failed login attempt
                $this->incrementLoginAttempts($user['id']);
                $attempts_left = $this->max_attempts - $user['login_attempts'] - 1;
                
                if($attempts_left <= 0) {
                    return [
                        "success" => false,
                        "message" => "Account locked. Please use your security word.",
                        "locked" => true
                    ];
                }
                
                return [
                    "success" => false,
                    "message" => "Invalid credentials. $attempts_left attempts remaining."
                ];
            }
            
            return ["success" => false, "message" => "Invalid credentials"];
            
        } catch(PDOException $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    private function incrementLoginAttempts($user_id) {
        $query = "UPDATE users SET 
                  login_attempts = login_attempts + 1,
                  locked_until = CASE 
                    WHEN login_attempts + 1 >= :max_attempts 
                    THEN DATE_ADD(NOW(), INTERVAL :lockout_duration SECOND)
                    ELSE NULL 
                  END
                  WHERE id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":max_attempts", $this->max_attempts);
        $stmt->bindParam(":lockout_duration", $this->lockout_duration);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
    }

    private function resetLoginAttempts($user_id) {
        $query = "UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
    }
}

// Handle requests
$database = new Database();
$db = $database->getConnection();
$auth = new Auth($db);

$data = json_decode(file_get_contents("php://input"));

if($_SERVER['REQUEST_METHOD'] === 'POST') {
    if(isset($data->action)) {
        switch($data->action) {
            case 'register':
                echo json_encode($auth->register($data->username, $data->email, $data->password, $data->security_word));
                break;
            case 'login':
                echo json_encode($auth->login($data->email, $data->password, $data->security_word));
                break;
            default:
                echo json_encode(["success" => false, "message" => "Invalid action"]);
        }
    }
}
?>