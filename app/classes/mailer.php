<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/src/Exception.php';
require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';

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


$mail->addAddress('ervin.sebastian.aesiph@gmail.com');
$mail->isHTML(true);
$mail->Subject = 'Test';
$mail->Body = 'Email Body';



if(!$mail->send()) 
{
echo "Mailer Error: " . $mail->ErrorInfo; 
} 
else { echo "Message has been sent successfully"; 
}
if(!$mail->send()) 
{ 
echo "Mailer Error: " . $mail->ErrorInfo; 
} 
else 
{ 
echo "Message has been sent successfully"; 
}
?>