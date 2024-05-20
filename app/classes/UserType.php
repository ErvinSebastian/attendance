

<?php
require_once('Database.php');
include 'constants.php';
class UserType extends Database
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

   
    public function get_user_types()
    {
        $params = $this->request;
        $filters = ' WHERE 1';
        // if (isset($params)) {
        //     $filters = ' WHERE user_type = "' . $params['user_type'] . '"';
        // }
        $query = 'SELECT * from user_types' . $filters;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        if (count($result) > 0) {
            return json_encode($result);
        } else {
            return json_encode(array('status' => 'incorrect'));
        }
    }

    public function get_user()
    {
        $params = $this->request;
        $filters = ' WHERE 1';
        if (isset($params['id'])) {
            $filters = ' WHERE id = "' . $params['id'] . '"';
        }
        $query = 'SELECT * from users' . $filters;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        if (count($result) > 0) {
            return json_encode(array('status' => 200, 'data' => $result));
        } else {
            return json_encode(array('status' => 'incorrect'));
        }
    }

    public function save()
    {
        $request = $this->request;
            $query = isset($request['id']) ? 'UPDATE users SET username = ?, first_name = ? , last_name = ? , email = ? , contact_no = ?, course_name = ?, course_id = ?, age = ? where id = ?' : "INSERT INTO `users` set username = ?, first_name = ? , last_name = ? , email = ? , contact_no = ?, course_name = ?, course_id = ?, age = ?";
            $stmt = $this->conn->prepare($query);
       
            if (isset($request['id'])) {
             $stmt->bind_param("ssssssisi", $request['username'], $request['first_name'], $request['last_name'], $request['email'], $request['contact_no'],$request['course'], $request['course_id'],$request['age'], $request['id']);
            } else {
              $stmt->bind_param("sssssis", $request['username'], $request['first_name'], $request['last_name'], $request['email'], $request['contact_no'], $request['contact_name'], $request['course_id'], $request['age']);
            }

           
            $result = $stmt->execute();

            if ($result != false) {
                $response['message'] = 'Success';
                $response['status'] = 200;
                $data = json_decode($this->get_user());
                $response['data'] = $data->data;
               
            } else {
                $response['error'] = $this->conn->error;
            }       
     
            return json_encode($response);
       
    }
    // public function logout()
    // {
    //     if ($this->settings->sess_des()) {
    //         redirect('admin/login.php');
    //     }
    // }
    // public function login_client()
    // {
    //     extract($_POST);
    //     $password = md5($password);
    //     $stmt = $this->conn->prepare("SELECT * from client_list where email = ? and `password` =? and delete_flag = ?  ");
    //     $delete_flag = 0;
    //     $stmt->bind_param("ssi", $email, $password, $delete_flag);
    //     $stmt->execute();
    //     $result = $stmt->get_result();
    //     if ($result->num_rows > 0) {
    //         $data = $result->fetch_array();
    //         if ($data['status'] == 1) {
    //             foreach ($data as $k => $v) {
    //                 if (!is_numeric($k) && $k != 'password') {
    //                     $this->settings->set_userdata($k, $v);
    //                 }
    //             }
    //             $this->settings->set_userdata('login_type', 2);
    //             $resp['status'] = 'success';
    //         } else {
    //             $resp['status'] = 'failed';
    //             $resp['msg'] = ' Your Account has been blocked by the management.';
    //         }
    //     } else {
    //         $resp['status'] = 'failed';
    //         $resp['msg'] = ' Incorrect Email or Password.';
    //         $resp['error'] = $this->conn->error;
    //         $resp['res'] = $result;
    //     }
    //     return json_encode($resp);
    // }
    // public function logout_client()
    // {
    //     if ($this->settings->sess_des()) {
    //         redirect('?');
    //     }
    // }
}

// $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// $uri = explode( '/', $uri );
// echo $uri;
// $action = !isset($_GET['f']) ? 'none' : strtolower($_GET['f']);
// $auth = new User();
// switch ($action) {
//     case 'login':
//         echo $auth->login();
//         break;
//     case 'register':
//         echo $auth->register();
//         break;
//     case 'get_users':
//         echo $auth->get_users();
//         break;
//     case 'get_user':
//         echo $auth->get_user();
//         break;
//     case 'save_user':
//         echo $auth->save();
//         break;
//     default:
//         echo $auth->index();
//         break;
// }
