

<?php
require_once('Database.php');
include 'constants.php';
class Subject extends Database
{
    private $settings;
    private $request;
    public function __construct()
    {
        global $_settings;
        $this->settings =  $_settings;
        $this->request = $_REQUEST? $_REQUEST : json_decode(file_get_contents('php://input'), 1);

        parent::__construct();
        ini_set('display_error', 1);
    }
    public function __destruct()
    {
        parent::__destruct();
    }
    public function index()
    {
        echo "<h1>Access Denied</h1> <a href='" . base_url . "'>Go Back.</a>";
    }
  
   
    public function get_subjects()
    {
        $params = $this->request;
        $filters = ' WHERE 1';
        // if (isset($params)) {
        //     $filters = ' WHERE user_type = "' . $params['user_type'] . '"';
        // }
        $query = 'SELECT * from subjects' . $filters;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        if (count($result) > 0) {
            return json_encode($result);
        } else {
            return json_encode(array());
        }
    }

    public function get_subject()
    {
        $params = $this->request;
        $filters = ' WHERE 1';
        if (isset($params['id'])) {
            $filters = ' WHERE id = "' . $params['id'] . '"';
        }
        $query = 'SELECT * from subjects' . $filters;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        if (count($result) > 0) {
            return json_encode(array('status' => 200, 'data' => $result, 'params' => $params));
        } else {
            return json_encode(array('status' => 'incorrect'));
        }
    }

    public function save()
    {
        $request = $this->request;
            $query = $request['id'] > 0? 'UPDATE subjects SET name = ?, description = ? where id = ?' : "INSERT INTO `subjects` set name = ?, description = ?";
            $stmt = $this->conn->prepare($query);
       
            if ($request['id'] > 0) {
             $stmt->bind_param("ssi", $request['name'], $request['description'], $request['id']);
            } else {
              $stmt->bind_param("ss", $request['name'], $request['description']);
                
            }

           
            $result = $stmt->execute();

            if ($result != false) {
                $response['message'] = 'Success';
                $response['status'] = 200;
                $response['params'] = $request['id'];
              
                $data = json_decode($this->get_subjects());
                $response['data'] = $data;
               
            } else {
                $response['error'] = $this->conn->error;
            }       
     
            return json_encode($response);
       
    }
    
}