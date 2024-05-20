

<?php
require_once('Database.php');
include 'constants.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/src/Exception.php';
require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';
class User extends Database
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
    public function login()
    {

    
        $data = $this->request;
        $hashed_password =md5($data['password']);
        


        $stmt = $this->conn->prepare("SELECT id, age, contact_no, course_id, course_name, email, user_type_id, user_type_name, is_approved,
        name from users where email = ? and `password` = ? ");
        $stmt->bind_param("ss", $data['email'], $hashed_password);

        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
       

       
        if ($result) {
             $stmt =  $this->conn->prepare('UPDATE users SET token  = ? where id = ?');
             $result['token'] = uniqid();
             $stmt->bind_param("si",$result['token'], $result['id']);
             $rt_result = $stmt->execute();
            if($result['is_approved'] && isset($result['is_approved'])){
               return json_encode(array('status' => 200, 'message' => 'Success', 'data' => $result));
            }else{
                return json_encode(array('status' => 204, 'message' => 'Your account is not yet approved', 'data' => $result));
            }   
        } else {
            return json_encode(array('status' => 204, 'message' => 'Invalid Credentials' ));
        }
    }

    public function register()
    {
        $response = [
            'message' => 'Something went wrong',
            'status' => 400,
            'error' => '',
        ];

        $user = $this->request;
        $user['password'] = md5($user['password']);
        $user['user_type_name'] = 'student';
        $user['user_type_id'] = 1;
        $user['is_approved'] = 0;

        $stmt = $this->conn->prepare("INSERT INTO users (name, password, user_type_name,user_type_id, email, is_approved) VALUES (?,?,?,?,?,?)");
        $stmt->bind_param("sssisi",$user['name'], $user['password'], $user['user_type_name'], $user['user_type_id'], $user['email'], $user['is_approved']);
        $result = $stmt->execute();
    

        if ($result != false) {
            $response['message'] = 'Success';
            $response['status'] = 200;
        } else {
            $response['error'] = $this->conn->error;
        }
        return json_encode($response);
    }

    public function get_teachers()
    {
        $params = $this->request;
        $filters = ' WHERE user_type_id = 5';
        // if (isset($params)) {
        //     $filters = ' WHERE user_type = "' . $params['user_type'] . '"';
        // }
        $query = 'SELECT id, name, user_type_id from users' . $filters;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        if (count($result) > 0) {
            return json_encode($result);
        } else {
            return json_encode(array());
        }
    }

    public function get_students()
    {
        $params = $this->request;
        $filters = ' WHERE user_type_id = 1 AND is_approved = 1';
        // if (isset($params)) {
        //     $filters = ' WHERE user_type = "' . $params['user_type'] . '"';
        // }
        $query = 'SELECT * from users' . $filters;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        if (count($result) > 0) {
            return json_encode($result);
        } else {
            return json_encode(array());
        }
    }
    public function get_students_by_query()
    {
        $params = $this->request;
        $filters = 'WHERE 1 ';
        
        if(isset($params['searchText']) && $params['searchText'] != ""){
            $search_text = $params['searchText'];
            $filters .= " AND user_type_id = 1 AND is_approved = 1 AND name LIKE '%$search_text%'";
            
        }else{
            $filters .= " AND user_type_id = 1 AND is_approved = 1";
        }

        if(isset($params['selected_ids']) && $params['selected_ids']){
             $filters .= " AND id NOT IN ('" . implode("','", $params['selected_ids']) . "')";
        }

        $query = 'SELECT id, name, course_name from users ' . $filters . ' LIMIT 10';
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        // if(isset($params['selected_ids']) && $params['selected_ids']){
        //     // $filters .= " AND id NOT IN ('" . implode("','", $params['selected_ids']) . "')";
        //      foreach($result as $i => $user){
        //         if(in_array($user['id'], $params['selected_ids'])){
        //             $result[$i]['is_selected'] = true;
        //         }
                
        //     }
          
           
        // }
        if (count($result) > 0) {
            return json_encode($result);
        } else {
            return json_encode(array('data' => []));
        }
    }

     public function get_users()
    {
        $params = $this->request;
        $filters = ' WHERE 1';
        // if (isset($params)) {
        //     $filters = ' WHERE user_type = "' . $params['user_type'] . '"';
        // }
        $query = 'SELECT * from users' . $filters;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        if (count($result) > 0) {

            foreach($result as $i => $user){
                $result[$i]['is_approved'] = $user['is_approved'] == 1 ? 'Approved' : 'Not Approved';
            }
            return json_encode($result);
        } else {
            return json_encode(array('status' => 'incorrect'));
        }
    }

    public function get_user($id)
    {
      
            $params = $this->request;
            $filters = ' WHERE 1';
            if ($id > 0) {
                $filters = ' WHERE id = "' . $id . '"';
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
            $query = isset($request['id']) ? 'UPDATE users SET username = ?, name = ? , email = ? , contact_no = ?, course_name = ?, course_id = ?, age = ?, user_type_name = ?, user_type_id = ?, is_approved = ?, student_id = ? where id = ?' 
                :"INSERT INTO `users` set username = ?, name = ?, email = ? , contact_no = ?, course_name = ?, course_id = ?, age = ?, user_type_name = ?, user_type_id = ?, is_approved = ?, password = ?, student_id = ?";
            $stmt = $this->conn->prepare($query);
            $password = '';
            if (isset($request['id'])) {
             $stmt->bind_param("sssssissiisi", $request['username'], $request['name'], $request['email'], $request['contact_no'],$request['course_name'], $request['course_id'],$request['age'],$request['user_type_name'], $request['user_type_id'], $request['is_approved'], $request['student_id'], $request['id']);
             $result = $stmt->execute();
             $user_id = $request['id'];
            
            } else {

                if(!isset($request['password'])){
                    $password = substr(str_shuffle(MD5(microtime())), 0, 6);
                    $encrypted_password = md5($password);
                }
                $stmt->bind_param("sssssiisiiss", 
                    $request['username'], 
                    $request['name'], 
                    $request['email'], 
                    $request['contact_no'],   
                    $request['course_name'], 
                    $request['course_id'], 
                    $request['age'],
                    $request['user_type_name'], 
                    $request['user_type_id'], 
                    $request['is_approved'],
                    $encrypted_password,
                    $request['student_id']
                );
                 $result = $stmt->execute();
                 $user_id = mysqli_stmt_insert_id($stmt);
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


                        $mail->addAddress($request['email']);
                        $mail->isHTML(true);
                        $mail->Subject = 'Your Account was approved by the admin';
                        $mail->Body = 'Your generated password is ' . $password;
                        $mail->send();
                }catch(Exception $e){
                    $response['error'] = $e;
                }
            }

            if ($result != false) {
                $response['message'] = 'Success';
                $response['status'] = 200;
                $response['id'] = $user_id;
                $data = json_decode($this->get_user($user_id));
                
                $response['data'] = $data->data;
                return json_encode($response);
               
            } else {
                $response['error'] = $this->conn->error;
                return $response;
            }       
     
            
       
    }
    public function user_summary(){
         $request = $this->request;
         $user = $request['user'];
         $subject_filters = ' WHERE 1';
         if ($request['user']['user_type_name'] == 'student') {
            $subject_filters = ' WHERE student_id = "' . $user['id'] . '"';

            $query = 'SELECT * from class_students LEFT JOIN classes ON class_students.class_id = classes.id' . $subject_filters;
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $subjects = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $response['subjects'] = $subjects;
            if(isset($subjects) && count($subjects) > 0 ){
       
                foreach($subjects as $i=>$subject){
                        $response['subjects'][$i]['attendances'] = [];
                        $response['subjects'][$i]['total_present'] = 0;
                        $response['subjects'][$i]['total_late'] = 0;
                        $attendance_filters = ' WHERE user_id = "' . $user['id'] . '" AND class_id = "' . $subject['class_id'] . '"';
                        $query = 'SELECT * from class_attendances' . $attendance_filters;
                        $stmt = $this->conn->prepare($query);
                        $stmt->execute();
                        $attendances = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

                        foreach($attendances as $att){
                            if($att['status'] == 'Present'){
                                $response['subjects'][$i]['total_present'] += 1;
                            }

                            if($att['status'] == 'Late'){
                                $response['subjects'][$i]['total_late'] += 1;
                            }
                        }
                        $response['subjects'][$i]['attendances'] = $attendances;
                }
               
              
                
            }
         }
           $top_students = [];
           //get top students
           $query = 'SELECT * from class_attendances';
           $stmt = $this->conn->prepare($query);
           $stmt->execute();
           $attendances_records = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

           if(count($attendances_records) > 0){


            foreach($attendances_records as $ac){
               

                if(!in_array($ac['student_name'], array_column($top_students, 'name'))){
                     $student_record = array('name' => $ac['student_name'], 'total' => $ac['status'] == 'Present' ? 1 : 0);
                     array_push($top_students, $student_record);
                }else{
                      $index = array_search($ac['student_name'], array_column($top_students, 'name'));
                      $top_students[$index]['total'] += $ac['status'] == 'Present' ? 1 : 0; 
                }
            }
             usort($top_students, function ($a, $b) { return $b['total'] - $a['total']; });
            if(count($top_students) > 0){
                $top_five = array_slice($top_students, 0, 5);
            }
          
            $response['top_students'] = $top_five;
            

            $query = 'SELECT COUNT(*) AS total_approved from users WHERE is_approved = 1';
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $total_approved = $stmt->get_result()->fetch_assoc();
            $response['no_of_approved_accounts'] = $total_approved['total_approved'];

            $query = 'SELECT COUNT(*) AS total_unapproved from users WHERE is_approved = 0';
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $total_unapproved = $stmt->get_result()->fetch_assoc();
            $response['no_of_unapproved_accounts'] = $total_unapproved['total_unapproved'];

            
           }
         return json_encode($response);
      

    }

    public function change_password()
    {
        $request = $this->request;
        $response['message'] = 'success';
        if(isset($request['user'])  && $request['password_data']){
                $hashed_password = md5($request['password_data']['old_password']);

                $stmt = $this->conn->prepare("SELECT id, name from users where email = ? and `password` = ? ");
                $stmt->bind_param("ss", $request['user']['email'], $hashed_password);

                $stmt->execute();

                if($stmt->get_result()->fetch_assoc()){
                    $new_password = md5($request['password_data']['new_password']);
                    $stmt =  $this->conn->prepare('UPDATE users SET password  = ? where id = ?');
                    $stmt->bind_param("si",$new_password, $request['user']['id']);
                    if($stmt->execute()){
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


                            $mail->addAddress($request['user']['email']);
                            $mail->isHTML(true);
                            $mail->Subject = 'Password Changed';
                            $mail->Body = 'Good Day ' . $request['user']['name'] . ' ! Your password was successfully changed!';
                            $mail->send();

                            $reponse['message'] = 'Your Password was successfully changed!';
                            $response['status'] = 200;
                    }catch(Exception $e){
                        $response['error'] = $e;
                    }

                    }
                
     
                }else{
                    $response['status'] = 204;
                    $response['message'] = 'Your old password is does not exists';
                }
        }
        return json_encode($response);
            
     
            
       
    }
    public function schedules(){
        date_default_timezone_set('Asia/Manila');
        $params = $this->request;
        $filters = ' WHERE student_id = ' . $params['user']['id'];
        $query = 'SELECT class_id from class_students' . $filters;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $class_ids = array_column($result, 'class_id');

         $classes = [];
         $sched_index = 0;
        $month = date('M');
        $year = date('Y');
        $start_date = "01-".$month."-".$year;
        $start_time = strtotime($start_date);

        $end_time = strtotime("+1 month", $start_time);

        for($i=$start_time; $i<$end_time; $i+=86400)
        {
        $days[] = date('Y-m-d', $i);
        }

      
        foreach($class_ids as $id){
              $query = "SELECT * from classes  WHERE id = " . $id;
              $stmt = $this->conn->prepare($query);
              $stmt->execute();
              $class_data = $stmt->get_result()->fetch_assoc();
             
              if($class_data){
                    $query = "SELECT * from class_schedules WHERE class_id = " . $id;
                    $stmt = $this->conn->prepare($query);
                    $stmt->execute();
                    $class_schedules = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
                    
                    if($class_schedules && count($class_schedules) > 0){
                        $class_data['schedules'] = [];
                        foreach($days as $day){
                            $complete_date =  date('Y-m-l-d', strtotime($day));
                            $day_name = explode('-', $complete_date)[2];
                            $index = array_search($day_name, array_column($class_schedules, 'name'));
                            $sched = $class_schedules[$index];
                            
                            if($sched['name'] == $day_name){
                                $startdate = date('Y-m-d H:i', strtotime($day .  $sched['time_in']));
                                $enddate = date('Y-m-d H:i', strtotime($day .  $sched['time_out']));
                               
                                $sched_data = array('title' => $class_data['name'], 'startDate' => $startdate, 'endDate' => $enddate, 'id' => $sched_index);
                                array_push($class_data['schedules'], $sched_data);
                                $sched_index++;
                            }
                        }
                    }
                    array_push($classes, $class_data);
              }
        }   
        $schedules = [];
        

        foreach($classes as $class){
            if(isset($class['schedules']) && count($class['schedules']) > 0){
                foreach($class['schedules'] as $schedule)
                array_push($schedules, $schedule);
            }
        }
       

        if (count($schedules) > 0) {
            return json_encode($schedules);
        } else {
            return json_encode([]);
        }
    }

    public function teachers_of_student_by_query()
    {
        $params = $this->request;
        $filters = 'WHERE 1 ';
        if($params['userId'] && $params['userId'] != ""){
            $user_id = $params['userId'];
            $filters .= " AND cs.student_id = ". $user_id;
        }
        $query = 'SELECT users.id, users.name from class_students as cs LEFT JOIN users ON cs.teacher_id = users.id ' . $filters;
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $class_ids = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        
        return json_encode(array('result' => $class_ids, 'query' => $query));
        
        // if($params['selected_ids'] && $params['selected_ids']){
        //     // $filters .= " AND id NOT IN ('" . implode("','", $params['selected_ids']) . "')";
        //      foreach($result as $i => $user){
        //         if(in_array($user['id'], $params['selected_ids'])){
        //             $result[$i]['is_selected'] = true;
        //         }
                
        //     }
           
        // }
        // if (count($result) > 0) {
        //     return json_encode($result);
        // } else {
        //     return json_encode(array('data' => []));
        // }
    }


    public function students_of_teacher_by_query()
    {
        $params = $this->request;
        $filters = 'WHERE 1 ';
        if($params['userId'] && $params['userId'] != ""){
            $user_id = $params['userId'];
            $filters .= " AND cs.teacher_id = ". $user_id;
        }
        $query = 'SELECT users.id, users.name from class_students as cs LEFT JOIN users ON cs.student_id = users.id ' . $filters;
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $raw_class_ids = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $class_ids = [];

        foreach($raw_class_ids as $user){
              if(!in_array($user['id'], array_column($class_ids, 'id'))){
                    array_push($class_ids, $user);
              }
        }
        
        return json_encode(array('result' => $class_ids, 'query' => $query));
        
     
    }

    public function subjects_of_student_by_query()
    {
        $params = $this->request;
        $filters = 'WHERE 1 ';
        if($params['userId'] && $params['userId'] != "" && $params['user_type_name'] == 'student'){
            $user_id = $params['userId'];
            $filters .= " AND cs.student_id = ". $user_id;
        }

          if($params['userId'] && $params['userId'] != "" && $params['user_type_name'] == 'teacher'){
            $user_id = $params['userId'];
            $filters .= " AND cs.teacher_id = ". $user_id;
        }
        $query = 'SELECT subjects.id, subjects.name from class_students as cs LEFT JOIN subjects ON cs.subject_id = subjects.id ' . $filters;
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $raw_class_ids = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $class_ids = [];  

        foreach($raw_class_ids as $user){
              if(!in_array($user['id'], array_column($class_ids, 'id'))){
                    array_push($class_ids, $user);
              }
        }
        
        
        return json_encode(array('result' => $class_ids, 'query' => $query));
    }

     public function attendance_report()
    {
        $params = $this->request;
        $filters = 'WHERE 1 ';


        if($params['userId'] && $params['userId'] != "" && $params['userTypeName'] == 'student'){
            $user_id = $params['userId'];
            $filters .= " AND cs.student_id = ". $user_id;
        }

         if($params['userId'] && $params['userId'] != "" && $params['userTypeName'] == 'teacher'){
            $user_id = $params['userId'];
            $filters .= " AND cs.teacher_id = ". $user_id;
        }
        $query = 'SELECT cs.class_id from class_students as cs LEFT JOIN subjects ON cs.subject_id = subjects.id ' . $filters;
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $classes = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $raw_class_ids = array_column($classes,"class_id");
        $class_ids = [];  
        foreach($raw_class_ids as $user){
              if(!in_array($user, $class_ids)){
                    array_push($class_ids, $user);
              }
        }
        if($params['userTypeName'] == 'student'){
             $filters = ' WHERE 1 AND user_id = '. $params['userId'];
        }
        if($params['userTypeName'] == 'teacher'){
             $filters = ' WHERE 1';
        }
       

        if(count($class_ids) > 0 && $class_ids){
            $filters .= " AND cs.class_id IN (" . implode(',', $class_ids) . ")";
        }
        $query = 'SELECT cs.status, c.subject_name, c.teacher_name, c.name, cs.student_name from class_attendances as cs LEFT JOIN classes as c ON cs.class_id = c.id' . $filters;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $classes = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        
        $attendance_data = [];

        foreach($classes as $class){
                if(!in_array($class['subject_name'], array_column($attendance_data, 'subject_name'))){
                    $record = array('subject_name' => $class['subject_name'], 'absent' => $class['status'] == 'Absent' ? 1 : 0,  'present' => $class['status'] == 'Present' ? 1 : 0,'teacher_name' => $class['teacher_name'], 'student_name' => $class['student_name']);
                    array_push($attendance_data, $record);
                }   
        }
        return json_encode(array('result' => $attendance_data, 'query' => $query));
     
    }
    
   
    
}


