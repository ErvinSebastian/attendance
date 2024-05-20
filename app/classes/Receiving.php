

<?php
require_once '../classes/Database.php';
include '../classes/constants.php';
class Receiving extends Database
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

    public function get_receivings()
    {
        $params = $this->request;
        $filters = ' WHERE 1';
        // if (isset($params)) {
        //     $filters = ' WHERE item_type = "' . $params['item_type'] . '"';
        // }
        $query = 'SELECT * from receivings' . $filters;
        $stmt = $this->conn->prepare($query);
        if ($stmt->execute()) {
            $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            return json_encode(array('status' => 200, 'data' => $result));
        } else {
            return json_encode(array('status' => 200, 'data' => [], 'message' => 'no record found'));
        }
    }

    public function get_receiving()
    {
        $params = $this->request;
        $filters = ' WHERE 1';
        if (isset($params['id'])) {
            $filters = ' WHERE id = "' . $params['id'] . '"';
        }
        $query = 'SELECT id, DATE(date_received) as date_received, received_by, dr_number from receivings' . $filters;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        if (count($result) > 0) {

            $query_ri = 'SELECT * from receiving_items WHERE receiving_id = "' . strval($result['id']) . '"';
            $stmt_ri = $this->conn->prepare($query_ri);
            $stmt_ri->execute();
            $receiving_items = $stmt_ri->get_result()->fetch_all(MYSQLI_ASSOC);
            $result['receiving_items'] = count($receiving_items) > 0 ? $receiving_items : [];


            return json_encode(array('status' => 200, 'data' => $result));
        } else {
            return json_encode(array('status' => 'incorrect'));
        }
    }

    public function save()
    {
        $request = $this->request;

        $query = $request['id'] > 0 ? 'UPDATE receivings SET date_received = ?, dr_number = ? ,received_by = ? where id = ?' : "INSERT INTO `receivings` set date_received = ?, dr_number = ?, received_by = ?";
        $stmt = $this->conn->prepare($query);
        if ($request['id'] > 0) {
            $stmt->bind_param("sssi", $request['date_received'], $request['dr_number'], $request['received_by'], $request['id']);
        } else {
            $stmt->bind_param("sss", $request['date_received'], $request['dr_number'], $request['received_by']);
        }

        $result = $stmt->execute();
        $receiving_items = $request['receiving_items'];
        $receiving_id = $request['id'] > 0 ? $request['id'] : $receiving_id = mysqli_stmt_insert_id($stmt);

        //get receiving itmes before delete
        $deleted_ris = [];
        $get_ri_stmt = $this->conn->prepare("SELECT * FROM receiving_items WHERE receiving_id=?");
        $get_ri_stmt->bind_param("i", $receiving_id);

        if ($get_ri_stmt->execute()) {
            $deleted_ris = $get_ri_stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        }


        $delete_stmt = $this->conn->prepare("DELETE FROM receiving_items WHERE receiving_id=?");
        $delete_stmt->bind_param("i", $receiving_id);
        $delete_stmt->execute();

        foreach ($receiving_items as $receiving_item) {

            $query_ri =  "INSERT INTO `receiving_items` set item_id = ?, item_description = ?, received_qty = ?, expiration_date = ?, date_manufactured = ?, receiving_id =?";
            $stmt_ri = $this->conn->prepare($query_ri);
            $stmt_ri->bind_param("sssssi", $receiving_item['item_id'], $receiving_item['item'], $receiving_item['qty_received'], $receiving_item['expiration_date'], $receiving_item['date_manufactured'], $receiving_id);


            $result_ri = $stmt_ri->execute();

            if ($result_ri != false) {
                $response['recompute'] = $this->recompute_storage_qty($receiving_item['item_id']);
            }
        }

        foreach ($deleted_ris as $ri) {
            $this->recompute_storage_qty($ri['item_id']);
        }

        if ($result != false) {
            $response['message'] = 'Success';
            $response['status'] = 200;
        } else {
            $response['error'] = $this->conn->error;
        }


        return json_encode($response);
    }

    public function recompute_storage_qty($item_id)
    {
        $total_invoice_qty = 0;
        $query = 'SELECT * from invoice_items WHERE item_id ="' . $item_id . '"';
        $stmt = $this->conn->prepare($query);

        if ($stmt->execute()) {

            $invoice_records = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

            foreach ($invoice_records as $ri) {
                if (isset($ri['quantity'])) {
                    $qty = $ri['quantity'] > 0 ? $ri['quantity'] : 0;
                    $total_invoice_qty += ($qty * -1);
                }
            }
        }
        $total_received_qty = 0;
        $query_receiving = 'SELECT * from receiving_items WHERE item_id ="' . $item_id . '"';
        $stmt_receiving = $this->conn->prepare($query_receiving);
        if ($stmt_receiving->execute()) {
            $receiving_records = $stmt_receiving->get_result()->fetch_all(MYSQLI_ASSOC);

            foreach ($receiving_records as $ri) {
                if (isset($ri['received_qty'])) {
                    $qty = $ri['received_qty'] > 0 ? $ri['received_qty'] : 0;
                    $total_received_qty += $qty;
                }
            }
        }
        $total_current_qty = $total_received_qty + $total_invoice_qty;
        //update storage summaries
        $storage_summary_query = 'UPDATE storage_summaries SET quantity = ? where item_id = ?';
        $storage_summary_stmt = $this->conn->prepare($storage_summary_query);
        $storage_summary_stmt->bind_param("ss", $total_current_qty, $item_id);
        //update current qty
        if ($storage_summary_stmt->execute()) {
            $item_query = 'UPDATE items SET current_qty = ? where id = ?';
            $item_stmt = $this->conn->prepare($item_query);
            $item_stmt->bind_param("ss", $total_current_qty, $item_id);

            $item_stmt->execute();
        }
    }
}

$action = !isset($_GET['f']) ? 'none' : strtolower($_GET['f']);
$auth = new Receiving();
switch ($action) {
    case 'get_receivings':
        echo $auth->get_receivings();
        break;
    case 'get_receiving':
        echo $auth->get_receiving();
        break;
    case 'save_receiving':
        echo $auth->save();
        break;
    default:
        echo $auth->index();
        break;
}
