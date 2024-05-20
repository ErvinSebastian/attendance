

<?php
require_once('Database.php');
include 'constants.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;



class Classes extends Database
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
  
   
    public function get_classes()
    {
        $params = $this->request;
        $filters = ' WHERE 1';
        // if (isset($params)) {
        //     $filters = ' WHERE user_type = "' . $params['user_type'] . '"';
        // }
        $query = 'SELECT * from classes' . $filters;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        if (count($result) > 0) {
            return json_encode($result);
        } else {
            return json_encode(array());
        }
    }

    public function get_class()
    {
        $params = $this->request;
        $filters = ' WHERE 1';
        if (isset($params['id'])) {
            $filters = ' WHERE id = "' . $params['id'] . '"';
        }

        $filters_att = ' WHERE 1';     
        if (isset($params['user']['id']) && isset($params['user']['user_type_name']) && $params['user']['user_type_name'] == 'student') {
            $filters_att .= ' AND user_id = ' . intval($params['user']['id']);
        }
        $query = 'SELECT * ,school_year_from as schoolYearFrom, school_year_to as schoolYearTo from classes' . $filters;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $class = $stmt->get_result()->fetch_assoc();
        if (count($class) > 0) {
             $student_class_qry = 'SELECT * from class_students WHERE class_id = ' . $class['id'];
             $stmt = $this->conn->prepare($student_class_qry);
             $stmt->execute();
             $student_class = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

             $schedule_class_qry = 'SELECT *, TIME_FORMAT(time_in, "%H:%i") as time_in, TIME_FORMAT(time_in, "%h:%i %p") as time_in_label, TIME_FORMAT(time_out, "%H:%i") as time_out,TIME_FORMAT(time_out, "%h:%i %p") as time_out_label from class_schedules WHERE class_id = ' . $class['id'];
             $stmt = $this->conn->prepare($schedule_class_qry);
             $stmt->execute();
             $schedule_class = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);


             $class['students'] = [];
             $class['attendances'] = [];
             $class['schedules'] = $schedule_class;
             if(count($student_class) > 0){
                    $students = 'SELECT * from class_students WHERE class_id = ' . $class['id'];
                    $stmt = $this->conn->prepare($students);
                    $stmt->execute();
                    $class_students = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
                    foreach($class_students as $cs){
                            $student_qry= 'SELECT * from users WHERE id = ' . $cs['student_id'];
                            $stmt = $this->conn->prepare($student_qry);
                            $stmt->execute();
                            $student = $stmt->get_result()->fetch_assoc();
                            if(isset($student) && count($student) > 0){
                                  array_push($class['students'], $student);
                            }
                          
                    }
                    
                    $attendances = 'SELECT * from class_attendances' . $filters_att .' AND class_id = ' . $class['id'];
                    $stmt = $this->conn->prepare($attendances);
                    $stmt->execute();
                    $class_attendances = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
                    $class['attendances'] = $class_attendances;
                    
             } 
            return json_encode(array('status' => 200, 'data' => $class, 'params' => $params, 'filter' => $filters_att));
        } else {
            return json_encode(array('status' => 'incorrect'));
        }
    }

    public function save()
    {
            $request = $this->request;
            $query = $request['id'] > 0 ? 'UPDATE classes SET name = ?, teacher_id = ? , teacher_name = ? , subject_id = ? , subject_name = ?, school_year_from = ?, school_year_to = ?, semester = ? where id = ?' 
            : "INSERT INTO `classes` set name = ?, teacher_id = ?, teacher_name = ?, subject_id = ? , subject_name = ?, school_year_from = ?, school_year_to = ?, semester = ?";
            
            $stmt = $this->conn->prepare($query);
        
            if ($request['id'] > 0) {
             $stmt->bind_param("sisissssi", 
                $request['name'], 
                $request['teacher_id'],
                $request['teacher_name'], 
                $request['subject_id'],
                $request['subject_name'], 
                $request['schoolYearFrom'], 
                $request['schoolYearTo'],
                $request['semester'],
                $request['id']);
            } else {
              $stmt->bind_param("sisissss", 
              $request['name'], 
              $request['teacher_id'],
              $request['teacher_name'], 
              $request['subject_id'],
              $request['subject_name'],
              $request['schoolYearFrom'], 
              $request['schoolYearTo'], 
              $request['semester']
            );
                
            }

           
            $result = $stmt->execute();
            $class_id = mysqli_stmt_insert_id($stmt);
            if ($result != false) {
             
                if ($request['id'] > 0) {
                    $class_id = $request['id'];
                    $delete_students_qry  =  "DELETE FROM class_students WHERE class_id=?";
                    $stmt = $this->conn->prepare($delete_students_qry);
                    $stmt->bind_param("i", $class_id);
                    $stmt->execute();

                    $class_id = $request['id'];
                    $delete_schedules_qry  =  "DELETE FROM class_schedules WHERE class_id=?";
                    $stmt = $this->conn->prepare($delete_schedules_qry);
                    $stmt->bind_param("i", $class_id);
                    $stmt->execute();
                }
                $result_ri = [];   

                if($request['students'] && count($request['students']) > 0){
                    
                    foreach ($request['students'] as $student) {
                    $query_cs =  "INSERT INTO `class_students` set class_id = ?, subject_id = ?, teacher_id = ?, teacher_name = ?, student_name = ?, student_id =?";
                    $stmt_cs = $this->conn->prepare($query_cs);
                    $stmt_cs->bind_param("iiissi", $class_id, $request['subject_id'], $request['teacher_id'], $request['teacher_name'], $student['name'], $student['id']);
                    $result_ri = $stmt_cs->execute();

                
                    }
                }

                $result_cs = [];   
                             
                if($request['schedules'] && count($request['schedules']) > 0){
                    
                 
                    foreach ($request['schedules'] as $schedule) {
                        
                    $time_in =  date('H:i:s', strtotime($schedule['time_in']));
                    $time_out =  date('H:i:s', strtotime($schedule['time_out']));
                    $query_cs =  "INSERT INTO `class_schedules` set class_id = ?, name = ?, time_in = ?, time_out = ?";
                    $stmt_cs = $this->conn->prepare($query_cs);
                    $stmt_cs->bind_param("isss", $class_id, $schedule['name'], $time_in, $time_out);
                    $result_cs = $stmt_cs->execute();
                    }
                }
                

                
                if($result_cs || $result_ri || count($request['students']) == 0){
                    $response['message'] = 'Success';
                    $response['status'] = 200;
                    $data = json_decode($this->get_class());
                    $response['data'] = $data->data;
                }     
                else 
                {
                    $response['error'] = $this->conn->error;
                }     
           
            }
        return json_encode($response);
       
    }

    public function time_in(){
        $request = $this->request;
     
        
        $time_in_date =  date('Y-m-d', strtotime($request['currentDate']));
       
        $time_in_datetime = date('Y-m-d', strtotime($request['currentDate']));
        $response = array('status' => 200 , 'message' => 'Scanned Succesfully');
        $subject_time_in = date('H:i:s', strtotime($request['schedule']['time_in']));
        $subject_time_out = date('H:i:s', strtotime($request['schedule']['time_out']));
            
        $time_in = date('H:i:s', strtotime($request['currentDate']));
 
        $filters = ' WHERE 1';

        //get class students
        $get_students_qry = 'SELECT * from class_students WHERE class_id = "'. $request['class_data']['id'].'"'; 
        $stmt_students_qry = $this->conn->prepare($get_students_qry);
        $stmt_students_qry->execute();
        // $student_ids = array_column($stmt_students_qry->get_result()->fetch_all(MYSQLI_ASSOC), 'student_id');

        $students = $stmt_students_qry->get_result()->fetch_all(MYSQLI_ASSOC);
                      
   
        if($students){
                foreach($students as $student){
                  
                    if($student['student_id'] == $request['user']['id']){
                        if (isset($request['currentDate'])) {
                            $filters = ' WHERE time_in_date = "' . $time_in_date . '" AND user_id = "'.$request['user']['id'] .'" AND class_id = "' . $request['class_data']['id'] .'" AND time_in ="' . $subject_time_in .'"';
                        }
                   
                        $get_class_qry = 'SELECT * from class_attendances' . $filters;
                        $stmt_class_qry = $this->conn->prepare($get_class_qry);
                        $stmt_class_qry->execute();
                        $attendances = $stmt_class_qry->get_result()->fetch_assoc();
                   
                        if(!isset($attendances)){
                            
                            if($request){
                                $status = 'Present';
                                $query = "INSERT INTO `class_attendances` set class_id = ?, user_id = ?, student_name = ?, status = ? , subject_id = ?, subject_name = ?, time_in_date = ?, time_in = ?";
                                $stmt_attendance = $this->conn->prepare($query);
                                $stmt_attendance->bind_param("iississs", $request['class_data']['id'], $request['user']['id'], $request['user']['name'], $status ,$request['class_data']['subject_id'], $request['class_data']['subject_name'], $time_in_datetime, $subject_time_in);
                                $stmt_attendance->execute();

                                $query = "SELECT * FROM classes where id = " . $request['class_data']['id'];
                                $stmt_update_class_total_attendance = $this->conn->prepare($query);
                                $stmt_update_class_total_attendance->execute();
                                $class = $stmt_update_class_total_attendance->get_result()->fetch_assoc();

                                if($class){

                                    $class_last_update =  date('Y-m-d', strtotime($class['last_update']));
                                    $current_date = date('Y-m-d');
                                    $response['class_last_update'] = $class_last_update;
                                    $response['current_date'] = $current_date;

                                    if($current_date != $class_last_update){
                                        $class_total_attendace = $class['total_attendances'] + 1;
                                        $query = "UPDATE classes SET total_attendances = ?, last_update = ?  WHERE id = " . $request['class_data']['id'];
                                        $stmt_attendance = $this->conn->prepare($query);
                                        $stmt_attendance->bind_param("is", $class_total_attendace, $current_date);
                                        $stmt_attendance->execute();
                                    }else{
                                        $query = "UPDATE classes SET last_update = ?  WHERE id = " . $request['class_data']['id'];
                                        $stmt_attendance = $this->conn->prepare($query);
                                        $stmt_attendance->bind_param("s",$current_date);
                                        $stmt_attendance->execute();
                                    }
                                }

                                try{
                                    $mail = new PHPMailer(true); //From email address and name 
                                    $mail->IsSMTP(); 
                                    $mail->SMTPOptions = array(
                                        'ssl' => array(
                                            'verify_peer' => false,
                                            'verify_peer_name' => false,
                                            'allow_self_signed' => true
                                        )
                                    );
                                    $mail->Host = 'smtp.gmail.com';
                                    $mail->SMTPAuth = true;
                                    $mail->Username = 'qrizesystem@gmail.com';
                                    $mail->Password ='uswfhlhhqyxkfqve';
                                    $mail->SMTPSecure = 'ssl';
                                    $mail->Port = 465;
                                    $mail->setFrom('qrizesystem@gmail.com');

                                    $email =  isset($request['user']['email']) ? $request['user']['email'] : '';
                                    $mail->addAddress($email);
                                    $mail->isHTML(true);
                                    $mail->Subject = 'Good Day!';
                                    $mail->Body = 'Your QR Code has scanned successfully!';
                                    $mail->send();
                                

                                }catch(Exception $e){
                                    $response['error'] = $e;
                                }
                            }
                        }else{
                            if($attendances['status'] == 'Absent'){
                                $new_status = 'Present';
                                $get_class_qry = 'UPDATE class_attendances SET status = ? WHERE id = ' . $attendances['id'];
                                $stmt_class_qry = $this->conn->prepare($get_class_qry);
                                $stmt_class_qry->bind_param("s", $new_status);
                                $stmt_class_qry->execute();
                            };
                        }
                    }


                    if($student['student_id'] != $request['user']['id']){

                         if (isset($request['currentDate'])) {
                            $filters = ' WHERE time_in_date = "' . $time_in_date . '" AND user_id = "'.$student['student_id'] .'" AND class_id = "' . $request['class_data']['id'] .'" AND time_in ="' . $subject_time_in .'"';
                        }
                   
                        $get_class_qry = 'SELECT * from class_attendances' . $filters;
                        $stmt_class_qry = $this->conn->prepare($get_class_qry);
                        $stmt_class_qry->execute();
                        $attendances = $stmt_class_qry->get_result()->fetch_assoc();

                        if(!isset($attendances)){
                            $status = 'Absent';
                            $query = "INSERT INTO `class_attendances` set class_id = ?, user_id = ?, student_name = ?, status = ? , subject_id = ?, subject_name = ?, time_in_date = ?, time_in = ?";
                            $stmt_attendance = $this->conn->prepare($query);
                            $stmt_attendance->bind_param("iississs", $request['class_data']['id'], $student['student_id'], $student['student_name'], $status ,$request['class_data']['subject_id'], $request['class_data']['subject_name'], $time_in_datetime, $subject_time_in);
                            $stmt_attendance->execute();

                            $query = "SELECT * FROM classes where id = " . $request['class_data']['id'];
                            $stmt_update_class_total_attendance = $this->conn->prepare($query);
                            $stmt_update_class_total_attendance->execute();
                            $class = $stmt_update_class_total_attendance->get_result()->fetch_assoc();

                            if($class){
                            $class_last_update =  date('Y-m-d', strtotime($class['last_update']));
                                $current_date = date('Y-m-d');
                                $response['class_last_update'] = $class_last_update;
                                $response['current_date'] = $current_date;

                                if($current_date != $class_last_update){
                                    $class_total_attendace = $class['total_attendances'] + 1;
                                    $query = "UPDATE classes SET total_attendances = ?, last_update = ?  WHERE id = " . $request['class_data']['id'];
                                    $stmt_attendance = $this->conn->prepare($query);
                                    $stmt_attendance->bind_param("is", $class_total_attendace, $current_date);
                                    $stmt_attendance->execute();
                                }else{
                                    $query = "UPDATE classes SET last_update = ?  WHERE id = " . $request['class_data']['id'];
                                    $stmt_attendance = $this->conn->prepare($query);
                                    $stmt_attendance->bind_param("s",$current_date);
                                    $stmt_attendance->execute();
                                } 
                            }

                        }

                    }
                  
                }
        }
     

         return json_encode(['data' => $response]);
    }

    public function get_student_subjects()
    {
        $params = $this->request;
        $filters = ' WHERE student_id = ' . $params['student_id'];
        // if (isset($params)) {
        //     $filters = ' WHERE user_type = "' . $params['user_type'] . '"';
        // }
        $query = 'SELECT class_id from class_students' . $filters;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $class_ids = array_column($result, 'class_id');

        $class_filters = " WHERE id IN  ('" . implode("','", $class_ids) . "')";
        
        $query = 'SELECT * from classes' . $class_filters;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        if (count($result) > 0) {
            return json_encode($result);
        } else {
            return json_encode(array());
        }

    }

     public function get_teacher_subjects()
    {
        $params = $this->request;
        $filters = ' WHERE teacher_id = ' . $params['teacher_id'];
        // if (isset($params)) {
        //     $filters = ' WHERE user_type = "' . $params['user_type'] . '"';
        // }
        $query = 'SELECT * from classes' . $filters;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        if (count($result) > 0) {
            return json_encode($result);
        } else {
            return json_encode(array());
        }
    }
    
}