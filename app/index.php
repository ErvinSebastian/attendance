<?php
require_once './classes/User.php';
require_once './classes/Course.php';
require_once './classes/Subject.php';
require_once './classes/Classes.php';
require_once './classes/UserType.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

$request = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode( '/', $uri );
$api_name = $uri[4];
switch ($api_name) {
    case 'users':
        $auth = new User();
        $id = isset($uri[5]) ? $uri[5] : 0;

        if($id > 0){
            if($request == 'GET'){
                 echo $auth->get_user($id);
            }
             if($request == 'POST'){
                 echo $auth->save();
            }
        }else{

            if($request == 'POST'){
               echo $auth->save();
            }
             if($request == 'GET'){
                 echo $auth->get_users();
            }
        }
        break;
    case 'courses':
        $auth = new Course();
         $id = isset($uri[5]) ? $uri[5] : 0;
         if($id > 0){
            if($request == 'GET'){
                 echo $auth->get_course();
            }
             if($request == 'POST'){
                 echo $auth->save();
            }
        }else{

            if($request == 'POST'){
               echo $auth->save();
            }
             if($request == 'GET'){
                 echo $auth->get_courses();
            }
        }
        break;
    case 'subjects':
        $auth = new Subject();
         $id = isset($uri[5]) ? $uri[5] : 0;
         if($id > 0){
            if($request == 'GET'){
                 echo $auth->get_subject();
            }
             if($request == 'POST'){
                 echo $auth->save();
            }
        }else{

            if($request == 'POST'){
               echo $auth->save();
            }
             if($request == 'GET'){
                 echo $auth->get_subjects();
            }
        }
        break;
    case 'classes':
        $auth = new Classes();
         $id = isset($uri[5]) ? $uri[5] : 0;
         if($id > 0){
            if($request == 'GET'){
                 echo $auth->get_class();
            }
             if($request == 'POST'){
                 echo $auth->save();
            }
        }else{

            if($request == 'POST'){
               echo $auth->save();
            }
             if($request == 'GET'){
                 echo $auth->get_classes();
            }
        }
        break;
        
        case 'teachers':
        $auth = new User();
        $id = isset($uri[5]) ? $uri[5] : 0;
            
        if($id > 0){
            if($request == 'GET'){
                 echo $auth->get_user();
            }
             if($request == 'POST'){
                 echo $auth->save();
            }
        }else{

            if($request == 'POST'){
               echo $auth->save();
            }
             if($request == 'GET'){
                 echo $auth->get_teachers();
            }
        }
        break;
        case 'students':
        $auth = new User();
        $id = isset($uri[5]) ? $uri[5] : 0;
            
        if($id > 0){
            if($request == 'GET'){
                 echo $auth->get_user();
            }
             if($request == 'POST'){
                 echo $auth->save();
            }
        }else{

            if($request == 'POST'){
               echo $auth->save();
            }
             if($request == 'GET'){
                 echo $auth->get_students();
            }
        }
      
        break;
    case 'user_types':
         $auth = new UserType();
        echo $auth->get_user_types();
        break;

     case 'student_subjects':
         $auth = new Classes();
        echo $auth->get_student_subjects();
        break;
    case 'teacher_subjects':
         $auth = new Classes();
        echo $auth->get_teacher_subjects();
        break;
    case 'get_students_by_query':
        $auth = new User();
        echo $auth->get_students_by_query();
        break;
    case 'teachers_of_student_by_query':
        $auth = new User();
        echo $auth->teachers_of_student_by_query();
        break;
    case 'students_of_teacher_by_query':
        $auth = new User();
        echo $auth->students_of_teacher_by_query();
        break;
    case 'subjects_of_student_by_query':
        $auth = new User();
        echo $auth->subjects_of_student_by_query();
        break;
    case 'attendance_report':
        $auth = new User();
        echo $auth->attendance_report();
        break;
    case 'get_user':
        echo $auth->get_user();
        break;
    case 'save_user':
        echo $auth->save();
        break;
    case 'login':
        $auth = new User();
        echo $auth->login();
        break;
    case 'register':
        $auth = new User();
        echo $auth->register();
        break;
    case 'change_password':
        $auth = new User();
        echo $auth->change_password();
        break;
    case 'time_in':
        $auth = new Classes();
        echo $auth->time_in();
        break;
    case 'user_summary':
        $auth = new User();
        echo $auth->user_summary();
        break;
    case 'schedules':
        $auth = new User();
        echo $auth->schedules();
        break;
    default:
        echo $auth->index();
        break;
}
?>