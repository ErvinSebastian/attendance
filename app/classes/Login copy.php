

<?php
require_once '../classes/Database.php';
include '../classes/constants.php';
class Login extends Database
{
    private $settings;
    public function __construct()
    {
        global $_settings;
        $this->settings = $_settings;

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
    public function login()
    {
        extract($_POST);
        $password = md5($password);
        $stmt = $this->conn->prepare("SELECT id, first_name, last_name, is_approved, user_type from users where username = ? and `password` = ? ");
        $stmt->bind_param("ss", $username, $password);


        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        if ($result) {
            // foreach ($result->fetch_array() as $k => $v) {
            //     if (!is_numeric($k) && $k != 'password') {
            //         $this->settings->set_userdata($k, $v);
            //     }
            // }
            // $this->settings->set_userdata('login_type', 1);
            return json_encode(array('status' => 200, 'user' => 'Success', 'data' => $result));
        } else {
            return json_encode(array('status' => 204, 'last_qry' => 'Invalid Credentials'));
        }
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
$action = !isset($_GET['f']) ? 'none' : strtolower($_GET['f']);
$auth = new Login();
switch ($action) {
    case 'login':
        echo $auth->login();
        break;
    case 'logout':
        echo $auth->logout();
        break;
    default:
        echo $auth->index();
        break;
}
