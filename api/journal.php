<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

class Journal {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($user_id, $title, $content, $tags, $mood) {
        try {
            $query = "INSERT INTO journal_entries (user_id, title, content, tags, mood) 
                     VALUES (:user_id, :title, :content, :tags, :mood)";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":content", $content);
            $stmt->bindParam(":tags", $tags);
            $stmt->bindParam(":mood", $mood);
            
            if($stmt->execute()) {
                return ["success" => true, "id" => $this->conn->lastInsertId()];
            }
            
            return ["success" => false, "message" => "Failed to create entry"];
            
        } catch(PDOException $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function getEntries($user_id) {
        try {
            $query = "SELECT * FROM journal_entries WHERE user_id = :user_id ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->execute();
            
            return ["success" => true, "entries" => $stmt->fetchAll(PDO::FETCH_ASSOC)];
            
        } catch(PDOException $e) {
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    // Add other methods for update and delete
}

// Handle requests
$database = new Database();
$db = $database->getConnection();
$journal = new Journal($db);

$data = json_decode(file_get_contents("php://input"));

switch($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if(isset($_GET['user_id'])) {
            echo json_encode($journal->getEntries($_GET['user_id']));
        }
        break;
    case 'POST':
        if(isset($data->user_id)) {
            echo json_encode($journal->create(
                $data->user_id,
                $data->title,
                $data->content,
                $data->tags,
                $data->mood
            ));
        }
        break;
}
?>