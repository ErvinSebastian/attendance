

<?php
require_once '../classes/Database.php';
include '../classes/constants.php';
class Master extends Database
{
    private $settings;
    private $request;
    public function __construct()
    {
        global $_settings;
        $this->settings = $_settings;
        parent::__construct();
        $this->request = json_decode(file_get_contents('php://input'), 1);
    }
    public function __destruct()
    {
        parent::__destruct();
    }
    public function login()
    {
        extract($_POST);
        $password = md5($password);
        $stmt = $this->conn->prepare("SELECT * from users where username = ? and `password` = ? ");
        $stmt->bind_param("ss", $username, $password);

        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            return json_encode(array('status' => 200, 'message' => 'Success'));
        } else {
            return json_encode(array('status' => 203, 'message' => "Invalid Credentials!"));
        }
    }

    public function get_users()
    {
        $stmt = $this->conn->prepare("SELECT * from users");
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        if (count($result) > 0) {
            return json_encode(array('status' => 200, 'data' => $result));
        } else {
            return json_encode(array('status' => 'incorrect'));
        }
    }

    public function save_user()
    {

        $response = [
            'message' => 'Something went wrong',
            'status' => 400,
            'error' => '',
        ];
        $user = $this->request;
        $user['password'] = md5($user['password']);

        $data = "";
        if (isset($user)) {
            foreach ($user as $k => $v) {
                if (!in_array($k, array('id'))) {
                    if (!is_array($v)) {
                        $v = $this->conn->real_escape_string($v);
                        if (!empty($data)) $data .= ",";
                        $data .= " `{$k}`='{$v}' ";
                    }
                }
            }
            $sql = "INSERT INTO `users` set {$data} ";
            $save = $this->conn->query($sql);
        }




        if (isset($save)) {
            $response['message'] = 'Saved';
            $response['status'] = 200;
        } else {
            $response['error'] = json_encode($response);
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
$action = !isset($_GET['f']) ? 'none' : strtolower($_GET['f']);
$auth = new Master();
switch ($action) {
    case 'get_users':
        echo $auth->get_users();
        break;
    case 'save_user':
        echo $auth->save_user();
        break;
    case 'logout':
        echo $auth->logout();
        break;
    default:
        echo $auth->index();
        break;
}
