

<?php
require_once '../classes/Database.php';
include '../classes/constants.php';
class Appointment extends Database
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

    public function get_appointments()
    {
        $params = $this->request;
        $filters = ' WHERE 1';
        // if (isset($params)) {
        //     $filters = ' WHERE item_type = "' . $params['item_type'] . '"';
        // }
        $query = 'SELECT TIME_FORMAT(requested_time, "%r") as requested_time, id, patient_name, requested_date, reason, is_approved, is_catered from appointments' . $filters;
        $stmt = $this->conn->prepare($query);
        if ($stmt->execute()) {
            $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            return json_encode(array('status' => 200, 'data' => $result));
        } else {
            return json_encode(array('status' => 200, 'data' => [], 'message' => 'no record found'));
        }
    }

    public function get_appointment()
    {
        $params = $this->request;
        $filters = ' WHERE 1';
        if (isset($params['id'])) {
            $filters = ' WHERE id = "' . $params['id'] . '"';
        }
        $query = 'SELECT TIME_FORMAT(requested_time, "%T") as requested_time, id, patient_name, requested_date, reason, is_approved, is_catered from appointments' . $filters;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        if (count($result) > 0) {
            return json_encode(array('status' => 200, 'data' => $result));
        } else {
            return json_encode(array('status' => 'incorrect'));
        }
    }

    
    public function get_patient_appointments()
    {
        $params = $this->request;
        $filters = ' WHERE 1';
        if (isset($params)) {
            $filters = ' WHERE patient_name = "' . $params['patient_name'] . '"';
        }
        $query = 'SELECT TIME_FORMAT(requested_time, "%r") as requested_time, id, patient_name, requested_date, reason, is_approved, is_catered from appointments' . $filters;
        $stmt = $this->conn->prepare($query);
        if ($stmt->execute()) {
            $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            return json_encode(array('status' => 200, 'data' => $result));
        } else {
            return json_encode(array('status' => 200, 'data' => [], 'message' => 'no record found'));
        }
    }


    public function save()
    {
        $request = $this->request;

        $query = $request['id'] > 0 ? 'UPDATE appointments SET patient_name = ?, requested_date = ? ,requested_time = ?, reason = ?, is_approved = ?, is_catered = ? where id = ?' : "INSERT INTO `appointments` set patient_name = ?, requested_date = ?, requested_time = ?, reason = ?, is_approved = ?, is_catered = ?";
        $stmt = $this->conn->prepare($query);
        if ($request['id'] > 0) {
            $stmt->bind_param("ssssssi", $request['patient_name'], $request['requested_date'], $request['requested_time'], $request['reason'], $request['is_approved'],$request['is_catered'], $request['id']);
        } else {
            $stmt->bind_param("ssssss", $request['patient_name'], $request['requested_date'], $request['requested_time'], $request['reason'], $request['is_approved'], $request['is_catered'],);
        }

        $result = $stmt->execute();

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
        $total_appointment_qty = 0;
        $query = 'SELECT * from appointment_items WHERE item_id ="' . $item_id . '"';
        $stmt = $this->conn->prepare($query);

        if ($stmt->execute()) {

            $appointment_records = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

            foreach ($appointment_records as $ri) {
                if (isset($ri['quantity'])) {
                    $qty = $ri['quantity'] > 0 ? $ri['quantity'] : 0;
                    $total_appointment_qty += ($qty * -1);
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
        $total_current_qty = $total_received_qty + $total_appointment_qty;
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
$auth = new Appointment();
switch ($action) {
    case 'get_appointments':
        echo $auth->get_appointments();
        break;
    case 'get_appointment':
        echo $auth->get_appointment();
        break;
        case 'get_patient_appointment':
            echo $auth->get_patient_appointments();
            break;
    case 'save_appointment':
        echo $auth->save();
        break;
    default:
        echo $auth->index();
        break;
}
