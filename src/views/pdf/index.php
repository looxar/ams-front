<?php

// $curl = curl_init();

// curl_setopt_array($curl, array(
//   CURLOPT_URL => 'http://172.30.211.224:42/api/pdf-producer',
//   CURLOPT_RETURNTRANSFER => true,
//   CURLOPT_ENCODING => '',
//   CURLOPT_MAXREDIRS => 10,
//   CURLOPT_TIMEOUT => 0,
//   CURLOPT_FOLLOWLOCATION => true,
//   CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
//   CURLOPT_CUSTOMREQUEST => 'POST',
//   CURLOPT_POSTFIELDS =>'{
//     "templateProjectPath": "sample/ams/506027-fixform.dito",
//     "templateName": "output",
//     "pdfVersion": "1.7",
//     "data": {
//         "cost_center_name": "กฟส.กทล.",
//         "date": "19 มิ.ย. 2567",
//         "type_other": "",
//         "brand": "HP",
//         "model": "ProDesk 600 G5",
//         "contract": "บ.75/2563",
//         "serial": "4CE03526C6",
//         "pea_no": "5330404643",
//         "problem": "ฮาร์ดิสชำรุด",
//         "emp_name": "นายอนุสรณ์ อมรรัตนศักดิ์",
//         "emp_role": "พบค.7",
//         "emp_id": "499857",
//         "tel": "(22)14890",
//         "inspector_name": "นายภาณุวิชญ์ ธานีวัฒน์",
//         "inspector_role": "นรค.7",
//         "inspector_date": "19 มิ.ย. 2567",
//         "dep_head_name": "นายสุเธียรพงศ์ ธนาอภิสิทธิ์โสภณ",
//         "dep_head_role": "หผ.คข.กดส.ฉ.2",
//         "dep_head_date": "19 มิ.ย. 2567"
//     }
// }',
//   CURLOPT_HTTPHEADER => array(
//     'Accept: application/pdf',
//     'Content-Type: application/json'
//   ),
// ));

// $response = curl_exec($curl);

// curl_close($curl);
// echo $response;

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  // Capture the data from the POST request (coming from your form submission)
  $cost_center_name = isset($_POST['cost_center_name']) ? $_POST['cost_center_name'] : '';

  // Prepare the JSON payload
  $data = [
      "templateProjectPath" => "sample/ams/506027-fixform.dito",
      "templateName" => "output",
      "pdfVersion" => "1.7",
      "data" => [
          "cost_center_name" => $cost_center_name,
          // "cost_center_name"=> "กฟส.กทล.",
          "date"=> "19 มิ.ย. 2567",
          "type_other"=> "",
          "brand"=> "HP",
          "model"=> "ProDesk 600 G5",
          "contract"=> "บ.75/2563",
          "serial"=> "4CE03526C6",
          "pea_no"=> "5330404643",
          "problem"=> "ฮาร์ดิสชำรุด",
          "emp_name"=> "นายอนุสรณ์ อมรรัตนศักดิ์",
          "emp_role"=> "พบค.7",
          "emp_id"=> "499857",
          "tel"=> "(22)14890",
          "inspector_name"=> "นายภาณุวิชญ์ ธานีวัฒน์",
          "inspector_role"=> "นรค.7",
          "inspector_date"=> "19 มิ.ย. 2567",
          "dep_head_name"=> "นายสุเธียรพงศ์ ธนาอภิสิทธิ์โสภณ",
          "dep_head_role"=> "หผ.คข.กดส.ฉ.2",
          "dep_head_date"=> "19 มิ.ย. 2567"
      ]
  ];

  // Convert the PHP array to JSON
  $jsonPayload = json_encode($data);

  // Initialize cURL session
  $curl = curl_init();

  // Set cURL options
  curl_setopt_array($curl, array(
      CURLOPT_URL => 'http://172.30.211.224:42/api/pdf-producer',
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => '',
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 0,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => 'POST',
      CURLOPT_POSTFIELDS => $jsonPayload, // Send the JSON payload
      CURLOPT_HTTPHEADER => array(
          'Accept: application/pdf',
          'Content-Type: application/json'
      ),
  ));

  // Execute the cURL request and capture the response
  $response = curl_exec($curl);

  // Check for cURL errors
  if (curl_errno($curl)) {
      echo 'cURL Error: ' . curl_error($curl);
  } else {
      // Output the response from the API
      header('Content-Type: application/pdf');
      echo $response;
  }

  // Close cURL session
  curl_close($curl);
} else {
  echo "No POST data received";
}