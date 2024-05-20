

<?php
require_once '../classes/Database.php';
include '../classes/constants.php';
class Item extends Database
{
    private $settings;
    private $request;
    public function __construct()
    {
        global $_settings;
        $this->settings = $_settings;
        $this->request = json_decode(file_get_contents('php://input'), 1);

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

    public function get_items()
    {
        $params = $this->request;
        $filters = ' WHERE 1';
        // if (isset($params)) {
        //     $filters = ' WHERE item_type = "' . $params['item_type'] . '"';
        // }
        $query = 'SELECT * from items' . $filters;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        if (count($result) > 0) {
            return json_encode(array('status' => 200, 'data' => $result));
        } else {
            return json_encode(array('status' => 200, 'data' => [], 'message' => 'no record found'));
        }
    }

    public function get_item()
    {
        $params = $this->request;
        $filters = ' WHERE 1';
        if (isset($params['id'])) {
            $filters = ' WHERE id = "' . $params['id'] . '"';
        }
        $query = 'SELECT * from items' . $filters;

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

        $query = $request['id'] > 0 ? 'UPDATE items SET description = ?, item_id = ?, inventory_id = ?, name = ? where id = ?' : "INSERT INTO `items` set description = ?, item_id = ?, inventory_id = ?, name = ?";

        $stmt = $this->conn->prepare($query);

        if ($request['id'] > 0) {
            $stmt->bind_param("ssssi", $request['description'], $request['item_id'], $request['inventory_id'], $request['name'], $request['id']);
        } else {
            $stmt->bind_param("ssss", $request['description'], $request['item_id'], $request['inventory_id'], $request['name']);
        }
        //storage_summaries

        $result = $stmt->execute();
        $item_id = $request['id'] > 0 ? $request['id'] : mysqli_stmt_insert_id($stmt);

        if ($result != false) {

            $qty = '0';
            $query_ss = $request['id'] > 0 ? 'UPDATE storage_summaries SET quantity = ? where item_id = ?' : "INSERT INTO `storage_summaries` set quantity = ?, item_id = ?";
            $stmt_ss = $this->conn->prepare($query_ss);
            $stmt_ss->bind_param("ss", $qty, $item_id);
            $result_ss = $stmt_ss->execute();
            if ($result_ss != false) {
                $response['item_id'] = $item_id;
                $response['message'] = 'Success';
                $response['status'] = 200;
                $response['item_id'] = $item_id;
            } else {
                $response['error'] = $this->conn->error;
            }
        } else {
            $response['error'] = $this->conn->error;
        }
        return json_encode($response);
    }
}
$action = !isset($_GET['f']) ? 'none' : strtolower($_GET['f']);
$auth = new Item();
switch ($action) {
    case 'get_items':
        echo $auth->get_items();
        break;
    case 'get_item':
        echo $auth->get_item();
        break;
    case 'save_item':
        echo $auth->save();
        break;
    default:
        echo $auth->index();
        break;
}
