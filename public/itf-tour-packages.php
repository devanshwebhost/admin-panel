<?php
/*
Plugin Name: Tour Package Management
Plugin URI: http://www.itfosters.com/
Description: This is plugins for tour package management.
Author: ITF Team
Version: 1.0
Author URI: http://www.itfosters.com/
*/
define("ITF_TOUR_PACK_PATH",dirname(__FILE__));
define("ITF_TOUR_PACK_URL",plugins_url("itf-tour-packages/"));

define("ITF_TP_DEFAULT_IMAGE",plugins_url("itf-tour-packages/")."images/default.jpeg");


include_once(ITF_TOUR_PACK_PATH."/class/category_package.php");
include_once(ITF_TOUR_PACK_PATH."/itf_thumb.php");
require_once(ITF_TOUR_PACK_PATH.'/lib/paypal.php'); 
//require_once(ITF_TOUR_PACK_PATH.'/lib/paytm/index.php'); 
require_once(ITF_TOUR_PACK_PATH.'/lib/razorpay/index.php');

class ITFTourPackage
{


	function __construct()
	{
		add_action( 'init', array($this,'tour_package_init') );
		add_action( 'widgets_init', array($this,'tour_package_register_widget' ));	
		add_action('save_post_itfpackage', array($this,'itf_save_post_tour_package_meta'), 1, 2);	
		add_action( 'wp_enqueue_scripts', array( $this, 'itf_tour_package_fron_css_js' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'itf_admin_tour_package_css_js' ) );


		add_action( 'admin_menu', array( $this, 'itf_tour_package_settings_page' ));
		add_action( 'admin_init', array( $this,'itf_tour_package_register_settings' ));

		add_shortcode( 'PACKAGECART', array( $this, 'itf_tour_package_booking') );
		add_shortcode( 'ORDERSUCCESS', array( $this, 'itf_tour_package_confirmation') );

		add_action( 'template_redirect', array( $this,'itf_checkout_page_template') );

		//PACKAGECART

		add_action( 'wp_ajax_nopriv_addpackage', array( $this, 'itf_tour_package_addpackage') );
		add_action( 'wp_ajax_addpackage', array( $this, 'itf_tour_package_addpackage' ) );

		add_action( 'wp_ajax_nopriv_itftpipn', array( $this, 'itf_tour_package_paypal_ipn') );
		add_action( 'wp_ajax_itftpipn', array( $this, 'itf_tour_package_paypal_ipn' ) );

		add_action( 'wp_ajax_nopriv_itftpresponse', array( $this, 'itf_tour_package_paypal_response') );
		add_action( 'wp_ajax_itftpresponse', array( $this, 'itf_tour_package_paypal_response' ) );


		add_action( 'wp_ajax_nopriv_packageoption', array( $this, 'itf_tour_package_packageoption') );
		add_action( 'wp_ajax_packageoption', array( $this, 'itf_tour_package_packageoption' ) );

		add_filter( 'manage_itftourorder_posts_columns', array( $this,'itf_custom_itf_tour_order_columns') );
		add_action( 'manage_itftourorder_posts_custom_column' , array( $this,'itf_tour_order_column'), 10, 2 );
		//add_filter( 'manage_edit-itftourorder_sortable_columns', array( $this,'itf_tour_order_sortable_columns'));
		//add_action( 'pre_get_posts', array( $this,'itf_tour_order_posts_orderby' ));

	}

	function itf_custom_itf_tour_order_columns($columns){

		$columns['tourdate'] = __( 'Tour Date', 'itf-tourpackage' );
		$columns['package_name'] = __( 'Package Name', 'itf-tourpackage' );
		$columns['paymentstatus'] = __( 'Payment Status', 'itf-tourpackage' );
    	$columns['transaction'] = __( 'Transaction Id', 'itf-tourpackage' );
		$columns['paymentmethod'] = __( 'Payment By', 'itf-tourpackage' );
		

    	return $columns;

	}

	function itf_tour_order_column($column, $post_id){

		switch ( $column ) {


			case 'tourdate' :
				echo get_post_meta( $post_id , 'tour_date' , true ); 
				break;

			case 'paymentstatus' :
				echo get_post_meta( $post_id , 'paymentStatus' , true ); 
				break;
	
			case 'transaction' :
				echo get_post_meta( $post_id , 'transactionid' , true ); 
				break;
			
			case 'paymentmethod' :
				echo get_post_meta( $post_id , 'paymentMethod' , true ); 
				break;
			
			case 'package_name' :
				$packageinfor= get_post_meta( $post_id , 'packages' , true );
				echo isset($packageinfor["title"])?$packageinfor["title"]:"None";
				break;
		}

	}

	function itf_tour_order_sortable_columns( $columns ) {
		$columns['tourdate'] = 'itf_tour_dates';
		return $columns;
	}

	function itf_tour_order_posts_orderby( $query ) {
		if( ! is_admin() || ! $query->is_main_query() ) {
			return;
		}
		
		if ( 'itf_tour_dates' === $query->get( 'orderby') ) {
			$query->set( 'orderby', 'meta_value' );
			$query->set( 'meta_key', 'tour_date' );
			$query->set( 'meta_type', 'date');
		}
	}

	function itf_tour_package_paypal_ipn(){

		$plantransactionid=isset($_REQUEST["txn_id"])?$_REQUEST["txn_id"]:"";
		$order_ids= isset($_REQUEST["custom"])?$_REQUEST["custom"]:"";
		$paymentstatus= isset($_REQUEST["payment_status"])?$_REQUEST["payment_status"]:"";
		
		$paymentdata = array(
			"transactionid"=>$plantransactionid,
			"paymentResponse"=>$_REQUEST,
			"paymentStatus"=>$paymentstatus
		);

		if ( FALSE === get_post_status( $order_ids ) ) {
			mail("rajwebsoft@gmail.com","IPN Response Order Not Existes",print_r($_REQUEST,true));
		}else{

			foreach ($paymentdata as $key => $value) { 
				if(get_post_meta($order_ids, $key, FALSE)) {
					update_post_meta($order_ids, $key, $value);
				} else { 
					add_post_meta($order_ids, $key, $value);
				}
			}

			$ordermeta=array();
			$ordermeta["travelers"]=get_post_meta($order_ids, "travelers", true);
			$ordermeta["packages"]=get_post_meta($order_ids, "packages", true);
			$ordermeta["totalprice"]=get_post_meta($order_ids, "totalprice", true);
			$ordermeta["discount"]=get_post_meta($order_ids, "discount", true);
			$ordermeta["grandtotal"]=get_post_meta($order_ids, "grandtotal", true);
			$ordermeta["firstName"]=get_post_meta($order_ids, "firstName", true);
			$ordermeta["lastName"]=get_post_meta($order_ids, "lastName", true);
			$ordermeta["useremail"]=get_post_meta($order_ids, "useremail", true);
			$ordermeta["phonenumber"]=get_post_meta($order_ids, "phonenumber", true);
			$ordermeta["hotelname"]=get_post_meta($order_ids, "hotelname", true);
			$ordermeta["hoteladdress"]=get_post_meta($order_ids, "hoteladdress", true);
			$ordermeta["pickup_address"]=get_post_meta($order_ids, "pickup_address", true);
			$ordermeta["town_city"]=get_post_meta($order_ids, "town_city", true);
			$ordermeta["zip"]=get_post_meta($order_ids, "zip", true);
			$ordermeta["tour_date"]=get_post_meta($order_ids, "tour_date", true);
			$ordermeta["additional_info"]=get_post_meta($order_ids, "additional_info", true);
			$ordermeta["paymentMethod"]=get_post_meta($order_ids, "paymentMethod", true);
			$ordermeta["ordernumber"]=get_post_meta($order_ids, "ordernumber", true);

			$bookinginfo=array();
			$bookinginfo["booking"] =$ordermeta;
			$bookinginfo["payment"] =$paymentdata;

			if($paymentstatus=="Completed")
				$orderinfo = wp_update_post(array('ID' => $order_ids,'post_status' => "publish"));
			
			ob_start();
			include_once(ITF_TOUR_PACK_PATH."/email/order.php");
			$mailinformation = ob_get_contents();
			ob_clean();


			$mailsubject= "Shuttletoagra - Order-#".$order_ids."";
			$useremailid = $ordermeta["useremail"];
			$headers = array('Content-Type: text/html; charset=UTF-8');
			$headers[] = "From: Shuttletoagra <info@shuttletoagra.com>";
			wp_mail( $useremailid, $mailsubject, $mailinformation, $headers);

			//Admin Email
			$headers[] = "CC: Shuttletoagra <contact@shuttletoagra.com>";
			$orderadminemail = "admin@shuttletoagra.com";
			wp_mail( $orderadminemail, $mailsubject, $mailinformation, $headers);

			//mail("rajwebsoft@gmail.com","IPN Response Order",print_r($_REQUEST,true));
		}
		 die();
	}

	function itf_tour_package_paypal_response(){
		$order_ids= isset($_REQUEST["custom"])?$_REQUEST["custom"]:"";
		$_SESSION['ORDERINFO']=array("orderid"=>$order_ids);
		wp_redirect(get_permalink( get_page_by_path( 'thanks' ) )); exit();

		//itftpipn   itftpresponse
	}

	function itf_tour_package_booking($atts, $content = ""){

		$atts = shortcode_atts( array('register' => 'register'), $atts);

		$packagecart= isset($_SESSION['PACKAGECART'])?$_SESSION['PACKAGECART']:array();

		$settingoptions = get_option( 'itf_tour_package_options' );

		$packageinfo=array();
		if(isset($packagecart["product_id"])){

			$product_id = $packagecart["product_id"];
			$attributes = $packagecart["attribute"];
 			$packageoption = $packagecart["packageoption"];
			$packageinfo["data"] = $this->packageinfo($product_id,$attributes["full"],$attributes["half"],$attributes["child"]);
			$packageinfo["package"]=$packageinfo["data"]['option'][$packageoption];

			$args = array('p' => $packagecart["product_id"], 'post_type' => 'itfpackage');
			$pack_tour_loop = new WP_Query($args);
			while ( $pack_tour_loop->have_posts() ) : $pack_tour_loop->the_post();
				$packageinfo["info"]=array(
					"title"=>get_the_title(),
					"ID"=>get_the_ID(),
					"attribute"=>$packagecart["attribute"],
					"price"=>get_post_meta(get_the_ID(), 'price', true),
					"child"=>get_post_meta(get_the_ID(), 'price_child', true)
				);
			endwhile;
		}

		ob_start();
		include_once(ITF_TOUR_PACK_PATH."/template/booking.php");
		$bookingstring= ob_get_contents();
		ob_end_clean();
		return $bookingstring;

	}

	function itf_tour_package_confirmation($atts, $content = ""){
		$atts = shortcode_atts( array('register' => 'register'), $atts);
		$orderstrdata ="";
		if(isset($_SESSION['ORDERINFO']["orderid"])){
			$orderstrdata = "Order Id : ".$_SESSION['ORDERINFO']["orderid"];
			$_SESSION['ORDERINFO']=array();
		}
		return $orderstrdata;

	}

	function itf_checkout_page_template() {
		
		if ( is_page( 'package-cart' )) {

			$packagecart= isset($_SESSION['PACKAGECART'])?$_SESSION['PACKAGECART']:array();

			if($_POST and isset($packagecart["product_id"])){
				
				//die("no");
				$isValidOrderCart=true;

				//itftpipn   itftpresponse itf_tour_package_options
				
				$packageinfo=array();
				$product_id = $packagecart["product_id"];
				$attributes = $packagecart["attribute"];
				$packageoption = $packagecart["packageoption"];
				$packageinfo["data"] = $this->packageinfo($product_id,$attributes["full"],$attributes["half"],$attributes["child"]);
				$packageinfo["package"]=$packageinfo["data"]['option'][$packageoption];

				//echo "<pre>"; print_r($packageinfo); die;
				
				$grandtotal=$packageinfo["package"]["total"]-$packageinfo["data"]["discount"];

				$args = array('p' => $packagecart["product_id"], 'post_type' => 'itfpackage');
				$pack_tour_loop = new WP_Query($args);
				while ( $pack_tour_loop->have_posts() ) : $pack_tour_loop->the_post();

					//echo "<pre>"; print_r($packagecart["attribute"]); print_r($packageinfo["package"]); die;	

					$alloption = array();
					$alloption["adult"]=array( "title"=> "Adult", "qty"=>$packagecart["attribute"]["full"], "price"=>$packageinfo["package"]["addultprice"], "total"=>$packagecart["attribute"]["full"]*$packageinfo["package"]["addultprice"]);
					$alloption["child"]=array( "title"=> "5-11 Child", "qty"=>$packagecart["attribute"]["half"], "price"=>$packageinfo["package"]["childprice"], "total"=>$packagecart["attribute"]["half"]*$packageinfo["package"]["childprice"]);
					$alloption["infant"]=array( "title"=> "Infant", "qty"=>$packagecart["attribute"]["child"],"price"=>$packageinfo["package"]["infant"], "total"=>$packagecart["attribute"]["child"]*$packageinfo["package"]["infant"]);
					

					$packageinfo["detail"]=array(
						"title"=>get_the_title(),
						"ID"=>get_the_ID(),
						"option_name"=>$packageinfo["package"]["title"],
						"option_desc"=>$packageinfo["package"]["description"],
						"attribute"=>$alloption
					);
				endwhile;

				$options = get_option( 'itf_tour_package_options' );

				

				//Order Create
				$ordermeta = array();
				$ordermeta["travelers"]=isset($_POST["traveler"])?$_POST["traveler"]:array();
				$ordermeta["packages"]=isset($packageinfo["detail"])?$packageinfo["detail"]:array();
				$ordermeta["totalprice"]=$packageinfo["package"]["total"];
				$ordermeta["discount"]=$packageinfo["data"]["discount"];
				$ordermeta["grandtotal"]=$grandtotal;
				$ordermeta["grandtotalinr"]= ($grandtotal * $options["inr_value"]);

				

				$ordermeta["firstName"]=$_POST["firstName"];
				$ordermeta["lastName"]=$_POST["lastName"];
				$ordermeta["useremail"]=$_POST["useremail"];
				$ordermeta["phonenumber"]=$_POST["phonenumber"];
				$ordermeta["hotelname"]=$_POST["hotelname"];
				$ordermeta["hoteladdress"]=$_POST["hoteladdress"];
				$ordermeta["pickup_address"]=$_POST["pickup_address"];
				$ordermeta["town_city"]=$_POST["town_city"];
				$ordermeta["zip"]=$_POST["zip"];
				$ordermeta["tour_date"]=$_POST["tour_date"];
				$ordermeta["additional_info"]=$_POST["additional_info"];
				$ordermeta["paymentMethod"]=$_POST["paymentMethod"];
				
				//echo "<pre>"; print_r($ordermeta); die;


				$order_ids = wp_insert_post(array (
					'post_type' => 'itftourorder',
					'post_title' => "Order-".date("F j, Y, g:i A"),
					'post_content' => "",
					'post_status' => 'pending',
					'comment_status' => 'closed',
					'ping_status' => 'closed',
				 ));

				 $ordermeta["ordernumber"]=$order_ids;

				 foreach ($ordermeta as $key => $value) { 
					if(get_post_meta($order_ids, $key, FALSE)) {
						update_post_meta($order_ids, $key, $value);
					} else { 
						add_post_meta($order_ids, $key, $value);
					}
				}

				//End of Order


				if(isset($_POST["paymentMethod"]) and $isValidOrderCart==true){

					

					if($_POST["paymentMethod"]=="razorpay"){

						//Paypal data update
						update_post_meta($order_ids, "paymentMethod", "razorpay");
						update_post_meta($order_ids, "paymentStatus", "Pending");
						$_SESSION['ORDERINFO']=array("orderid"=>$order_ids);
						//End Paypal data update
						RazorpayPayment::process_payment($ordermeta);
					}
					elseif($_POST["paymentMethod"]=="paypal"){

						//Paypal data update
						update_post_meta($order_ids, "paymentMethod", "paypal");
						update_post_meta($order_ids, "paymentStatus", "Pending");
						$_SESSION['ORDERINFO']=array("orderid"=>$order_ids);
						//End Paypal data update

						
						$itfpaypal = new Paypal(); 
						
						if(ITFTourPackage::isTestMode())
							$itfpaypal->paypal_url = 'https://www.sandbox.paypal.com/cgi-bin/webscr';
						else
							$itfpaypal->paypal_url = 'https://www.paypal.com/cgi-bin/webscr';

						$returnurl = get_permalink(get_page_by_path('package-cart'));

						$itfpaypal->add_field('business', $options["payment_email"]);
						$itfpaypal->add_field('return', admin_url( 'admin-ajax.php' ).'?action=itftpresponse');
						$itfpaypal->add_field('cancel_return', $returnurl.'?action=cancel');
						$itfpaypal->add_field('notify_url', admin_url( 'admin-ajax.php' ).'?action=itftpipn');
						$itfpaypal->add_field('item_name', $packageinfo[0]["title"]);
						$itfpaypal->add_field('amount', sprintf("%.2f",$grandtotal));

						$itfpaypal->add_field('first_name', $_POST['firstName']);
						$itfpaypal->add_field('last_name', $_POST['lastName']);
						$itfpaypal->add_field('custom', $order_ids);

						$itfpaypal->submit_paypal_post();
						//$itfpaypal->dump_fields();
						die;
					}else if($_POST["paymentMethod"]=="cash"){
						
						$plantransactionid= "CA".time().wp_rand(9,9)."SH";
						$paymentdata = array(
							"paymentMethod"=>"cash",
							"transactionid"=>$plantransactionid,
							"paymentResponse"=>array(),
							//"paymentStatus"=>"Pending",
							"paymentStatus"=>"Completed"
						);
						
						foreach ($paymentdata as $key => $value) { 
							if(get_post_meta($order_ids, $key, FALSE)) {
								update_post_meta($order_ids, $key, $value);
							} else { 
								add_post_meta($order_ids, $key, $value);
							}
						}
						$orderinfo = wp_update_post(array('ID' => $order_ids,'post_status' => "publish"));


						$bookinginfo=array();
						$bookinginfo["booking"] =$ordermeta;
						$bookinginfo["payment"] =$paymentdata;
						
						
						ob_start();
						include_once(ITF_TOUR_PACK_PATH."/email/order.php");
						$mailinformation = ob_get_contents();
						ob_clean();

						
						$mailsubject= "Shuttletoagra - Order-#".$order_ids."";
						$useremailid = $ordermeta["useremail"];
						$headers = array('Content-Type: text/html; charset=UTF-8');
						$headers[] = "From: Shuttletoagra <info@shuttletoagra.com>";
						wp_mail( $useremailid, $mailsubject, $mailinformation, $headers);

						//Admin Email
						$headers[] = "CC: Shuttletoagra <contact@shuttletoagra.com>";
						$orderadminemail = isset($options["order_email"])?$options["order_email"]:"admin@shuttletoagra.com";
						wp_mail( $orderadminemail, $mailsubject, $mailinformation, $headers);

						$_SESSION['ORDERINFO']=array("orderid"=>$order_ids);
						wp_redirect(get_permalink( get_page_by_path( 'thanks' ) )); exit();
					}
				}
			} 


		}
	}
	

	function itf_tour_package_addpackage(){

		$results= array("status"=>"failed","message"=>"Package information invalie");
		if(isset($_POST["attribute"]) and isset($_POST["package_id"])){

			if(isset($_SESSION['PACKAGECART']) and is_array($_SESSION['PACKAGECART'])){

			}else{
				$_SESSION['PACKAGECART']=[];	
			}

			$_SESSION['PACKAGECART']=array("product_id"=>$_POST["package_id"],"attribute"=>$_POST["attribute"],"packageoption"=>$_POST["packageoption"]);

			$results= array("status"=>"success","message"=>"Package has been added","redirect"=>get_permalink(get_page_by_path('package-cart')));
		}
		echo json_encode($results);
		die;
	}

	function packageinfo($package_id,$adultatr,$childatr,$infantatr){

			$fullprice = get_post_meta($package_id, 'price', true);
			$price_child = get_post_meta($package_id, 'price_child', true);
			$extra_person_price = get_post_meta($package_id, 'extra_person_price', true);
			$guide_price = get_post_meta($package_id, 'guide_price', true);
			$enterance_price = get_post_meta($package_id, 'enterance_price', true);
			$lunch_price = get_post_meta($package_id, 'lunch_price', true);

			$dis_guide = $guide_price/($childatr+$adultatr);
			$discountedamount=0;
			$isSoloPrice=false;

			if(!empty($extra_person_price) and $extra_person_price >1){
				$isSoloPrice=true;
			}else{
				if (isset($adultatr) and $adultatr>=1) {
					if($adultatr>=4)
						$discountedamount= ($fullprice *0.2)*$adultatr;
					elseif($adultatr>=3)
					$discountedamount= ($fullprice  *0.15)*$adultatr;
					elseif($adultatr>=2)
					$discountedamount= ($fullprice *0.1)*$adultatr;
					else
					$discountedamount=0;
				}
			}


			$allresult= array("option"=>array(),"adult"=>$adultatr,"child"=>$childatr,"infant"=>$infantatr,"discount"=>$discountedamount);


			$allresult["option"]["CGIL"]=array(
						"title"=>"Car + Guide + Entrance + Lunch ",
						"description"=>"Includes: Car with Driver + Guide + Entrance fees + Lunch at 5 Star Hotel.<br>Pickup included",
						"total"=>$adultatr*$fullprice + $childatr*$price_child + $enterance_price*($adultatr)+$lunch_price*($adultatr+$childatr)+$guide_price,
						"addultprice"=>$fullprice+$dis_guide + $enterance_price+$lunch_price,
						"childprice"=>$price_child+$dis_guide + $lunch_price,
						"infant"=>0
					);
			
			if($isSoloPrice==true){
				$allresult["option"]["CGIL"]["total"]= $fullprice + ($childatr*$price_child) + $enterance_price+$lunch_price+$guide_price + (($adultatr-1)*$extra_person_price);
				$allresult["option"]["CGIL"]["addultprice"]=(($fullprice+(($adultatr-1)*$extra_person_price))/$adultatr)+$dis_guide + ($enterance_price/($adultatr+$childatr)) + ($lunch_price/($adultatr+$childatr));
				$allresult["option"]["CGIL"]["childprice"]=$price_child +$dis_guide + ($lunch_price/$childatr);
			}

			$allresult["option"]["CGI"]=array(
				"title"=>"Car + Guide + Entrance",
				"description"=>"Includes: Car with Driver + Guide + Entrance fees. But Lunch is not included in this price.<br>Pickup included",
				"total"=>$adultatr*$fullprice + $childatr*$price_child +$guide_price + $enterance_price*($adultatr),
				"addultprice"=>$fullprice+$dis_guide+$enterance_price,
				"childprice"=>$price_child+$dis_guide,
				"infant"=>0
			);

			if($isSoloPrice==true){
				$allresult["option"]["CGI"]["total"]= $fullprice + ($childatr*$price_child) + $enterance_price+$guide_price + (($adultatr-1)*$extra_person_price);
				$allresult["option"]["CGI"]["addultprice"]=(($fullprice+(($adultatr-1)*$extra_person_price))/$adultatr)+$dis_guide + ($enterance_price/$adultatr);
				$allresult["option"]["CGI"]["childprice"]=$price_child + $dis_guide ;
			}

			$allresult["option"]["CG"]=array(
				"title"=>"Car + Guide ",
				"description"=>"Includes: Car with Driver + Guide. But entrance fees and breakfast are not included in this price.<br>Pickup included",
				"total"=>$adultatr*$fullprice + $childatr*$price_child+$guide_price,
				"addultprice"=>$fullprice+$dis_guide,
				"childprice"=>$price_child+$dis_guide,
				"infant"=>0
			);

			if($isSoloPrice==true){
				$allresult["option"]["CG"]["total"]= $fullprice + ($childatr*$price_child) + $guide_price + (($adultatr-1)*$extra_person_price);
				$allresult["option"]["CG"]["addultprice"]=(($fullprice+(($adultatr-1)*$extra_person_price))/$adultatr)+$dis_guide;
				$allresult["option"]["CG"]["childprice"]=$price_child + $dis_guide ;
			}

			$allresult["option"]["C"]=array(
				"title"=>"Car",
				"description"=>"Includes: Car with Driver only. Guide, entrance fees and Lunch are not included in this price.<br>Pickup included",
				"total"=>$adultatr*$fullprice + $childatr*$price_child,
				"addultprice"=>$fullprice,
				"childprice"=>$price_child,
				"infant"=>0
			);

			if($isSoloPrice==true){
				$allresult["option"]["C"]["total"]= $fullprice + ($childatr*$price_child) + (($adultatr-1)*$extra_person_price);
				$allresult["option"]["C"]["addultprice"]=(($fullprice+(($adultatr-1)*$extra_person_price))/$adultatr);
				$allresult["option"]["C"]["childprice"]=$price_child ;
			}

			return $allresult;
	}

	function itf_tour_package_packageoption(){

		$getatrribute = $_POST;
		$package_id = $getatrribute['package_id'];
		$adultatr = $getatrribute['aattribute_full'];
		$childatr = $getatrribute['attribute_half'];
		$infantatr = $getatrribute['attribute_child'];
		$alldata = $this->packageinfo($package_id,$adultatr,$childatr,$infantatr);
		?>	
		 <div id="descrip" class="descrip">
			<div id="accordion" >

				<?php $k=0; foreach($alldata["option"] as $key=>$rows){ $k++; ?>
				<div class="card mb-3">
					<div class="card-headers">
					  <a class="btn pack_options" data-bs-toggle="collapse" href="#option<?php echo $key;?>">
						<div class="package_title pull-left">	
							<h4 class="opt">Option <?php echo $k; ?> : <span><?php echo $rows["title"];?></span></h4>
						</div>
						<div class="package_price pull-right"><?php echo '$ ',$rows["total"];?></div>
					  </a>
					</div>

					<div id="option<?php echo $key;?>" class="collapse <?php echo $k==1?"show":""; ?>" data-bs-parent="#accordion">
						<div class="card-body">
							<div class="row">
								<div class="col-8">
									<p><?php echo $rows["description"];?></p>
								</div>
									
								<div class="col-4 text-right">
									<span  id="oneadult"><?php echo $alldata["adult"], ' Adult', ' x ','$ ',$rows["addultprice"]; ?></span></br>
									<?php if($alldata["child"]>0){ ?>
									<span id="onechild"><?php echo $alldata["child"], ' Child', ' x ','$ ',$rows["childprice"];?></span></br>
									<?php } ?>
									<?php if($alldata["infant"]>0){ ?>
									<span id="oneinfant"><?php echo $alldata["infant"], ' Infant', ' x ','$ ',$rows["infant"];?></span>
									<?php } ?>

									<div class="package_buy">
										<button type="button" class="btn btn-primary packagesbuy" data-productid="<?php echo $package_id; ?>" data-options="<?php echo $key;?>">BOOK NOW</button>
									</div>
								</div>
							</div>
						</div>
					</div> 
				</div>
			<?php }?>
			</div>
		</div>
		<?php 
		die;
	}


	function itf_tour_package_settings_page() {
		add_submenu_page( "edit.php?post_type=itfpackage",'Package Setting', 'Package Setting', 'manage_options', 'tour-package-setting', array( $this, 'itf_render_tour_package_settings_page') );
	}

	function itf_render_tour_package_settings_page() {
		?>
		<div class="wrap">
			<h1>Package Tour Settings</h1>
			<form action="options.php" method="post">
				<?php 
				settings_fields( 'itf_tour_package_options' );
				do_settings_sections( 'itf_tour_package_plugin' ); ?>
				<input name="submit" class="button button-primary" type="submit" value="<?php esc_attr_e( 'Save' ); ?>" />
			</form>
		</div>
		<?php
	}

	function itf_tour_package_register_settings() {
		register_setting( 'itf_tour_package_options', 'itf_tour_package_options', array( $this,'itf_tour_package_options_validate') );
		add_settings_section( 'itf_api_settings', 'Package Settings', array( $this,'itf_tour_package_section_text'), 'itf_tour_package_plugin' );
	
		add_settings_field( 'itf_tour_package_plugin_setting_test_mode', 'Test Mode', array( $this,'itf_tour_package_setting_test_mode'), 'itf_tour_package_plugin', 'itf_api_settings' );
		add_settings_field( 'itf_tour_package_plugin_setting_payment_email', 'Paypal Payment Email', array( $this,'itf_tour_package_setting_payment_email'), 'itf_tour_package_plugin', 'itf_api_settings' );
		add_settings_field( 'itf_tour_package_plugin_setting_order_email', 'Order Email ID', array( $this,'itf_tour_package_setting_order_email'), 'itf_tour_package_plugin', 'itf_api_settings' );
		add_settings_field( 'itf_tour_package_plugin_setting_inr_value', 'INR Value', array( $this,'itf_tour_package_setting_inr_value'), 'itf_tour_package_plugin', 'itf_api_settings' );

		//Razorpay Setting
		add_settings_section( 'itf_api_razorpay_settings', 'Razorpay Configuration', array( $this,'itf_tour_package_section_razorpay'), 'itf_tour_package_plugin' );
		
		add_settings_field( 'itf_tour_package_plugin_setting_live_key', 'Live Key', array( $this,'itf_tour_package_setting_live_key'), 'itf_tour_package_plugin', 'itf_api_razorpay_settings' );
		add_settings_field( 'itf_tour_package_plugin_setting_live_secret', 'Live Secret', array( $this,'itf_tour_package_setting_live_secret'), 'itf_tour_package_plugin', 'itf_api_razorpay_settings' );

		add_settings_field( 'itf_tour_package_plugin_setting_test_key', 'Test Key', array( $this,'itf_tour_package_setting_test_key'), 'itf_tour_package_plugin', 'itf_api_razorpay_settings' );
		add_settings_field( 'itf_tour_package_plugin_setting_test_secret', 'Test Secret', array( $this,'itf_tour_package_setting_test_secret'), 'itf_tour_package_plugin', 'itf_api_razorpay_settings' );
		
	}

	function itf_tour_package_options_validate( $input ) {
		
		$newinput=$input;
		$newinput['payment_email'] = trim( $input['payment_email'] );
		$newinput['order_email'] = trim( $input['order_email'] );
		$newinput['inr_value'] = trim( $input['inr_value'] );
		
		return $newinput;
	}

	function itf_tour_package_section_text() {
		echo '<p>Here you can set all the options for using the Package</p>';
	}

	function itf_tour_package_section_razorpay() {
		echo '<p>Here you can set all the options for razorpay</p>';
	}
	
	function itf_tour_package_setting_test_mode() {
		$options = get_option( 'itf_tour_package_options' );
		echo "<input class='regular-text' id='itf_tour_package_plugin_setting_test_mode' name='itf_tour_package_options[test_mode]' type='checkbox' value='1' ".($options['test_mode']==1?"checked='checked'":"")." />";
	}

	function itf_tour_package_setting_payment_email() {
		$options = get_option( 'itf_tour_package_options' );
		echo "<input class='regular-text' id='itf_tour_package_plugin_setting_payment_email' name='itf_tour_package_options[payment_email]' type='text' value='".esc_attr( $options['payment_email'] )."' />";
	}

	function itf_tour_package_setting_order_email() {
		$options = get_option( 'itf_tour_package_options' );
		echo "<input class='regular-text' id='itf_tour_package_plugin_setting_order_email' name='itf_tour_package_options[order_email]' type='text' value='".esc_attr( $options['order_email'] )."' />";
	}

	function itf_tour_package_setting_inr_value() {
		$options = get_option( 'itf_tour_package_options' );
		echo "<input class='regular-text' id='itf_tour_package_plugin_setting_inr_value' name='itf_tour_package_options[inr_value]' type='text' value='".esc_attr( $options['inr_value'] )."' />";
	}

	function itf_tour_package_setting_live_key() {
		$options = get_option( 'itf_tour_package_options' );
		echo "<input class='regular-text' id='itf_tour_package_plugin_setting_live_key' name='itf_tour_package_options[live_key]' type='text' value='".esc_attr( $options['live_key'] )."' />";
	}

	function itf_tour_package_setting_live_secret() {
		$options = get_option( 'itf_tour_package_options' );
		echo "<input class='regular-text' id='itf_tour_package_plugin_setting_live_secret' name='itf_tour_package_options[live_secret]' type='text' value='".esc_attr( $options['live_secret'] )."' />";
	}

	function itf_tour_package_setting_test_key() {
		$options = get_option( 'itf_tour_package_options' );
		echo "<input class='regular-text' id='itf_tour_package_plugin_setting_test_key' name='itf_tour_package_options[test_key]' type='text' value='".esc_attr( $options['test_key'] )."' />";
	}

	function itf_tour_package_setting_test_secret() {
		$options = get_option( 'itf_tour_package_options' );
		echo "<input class='regular-text' id='itf_tour_package_plugin_setting_test_secret' name='itf_tour_package_options[test_secret]' type='text' value='".esc_attr( $options['test_secret'] )."' />";
	}

	public static function isTestMode(){
		$options = get_option( 'itf_tour_package_options' );
		return (isset($options["test_mode"]) && $options["test_mode"]=="1")?true:false;
	}


	function itf_admin_tour_package_css_js(){

		wp_enqueue_style( 'Itf-tour_package-css', ITF_TOUR_PACK_URL."css/tour_package.css" );
		wp_enqueue_style( 'Itf-select2-css', ITF_TOUR_PACK_URL."js/select2.css" );
		wp_enqueue_script( 'Itf-select2-js', ITF_TOUR_PACK_URL."js/select2.js",array(), '',true );

	}

	function itf_tour_package_fron_css_js(){
		wp_enqueue_style( 'Itf-tour_package-css', ITF_TOUR_PACK_URL."css/tour_package.css",array(), '1.0.0' );
		wp_enqueue_style( 'Itf-cal-css', ITF_TOUR_PACK_URL."css/itf-cal.css" );
		wp_enqueue_style( 'Itf-itf_popup_min-css', ITF_TOUR_PACK_URL."css/itf_popup_min.css" );
		wp_enqueue_script( 'Itf-itf_popup.min-js', ITF_TOUR_PACK_URL."js/itf_popup.min.js",array(), '',true );
		wp_enqueue_script( 'Itf-itf_cal-js', ITF_TOUR_PACK_URL."js/ITFS.js",array(), '',true );
		wp_enqueue_script( 'Itf-package-js', ITF_TOUR_PACK_URL."js/package.js",array(), '',true );
		wp_localize_script( 'Itf-package-js', 'ITF_PACKAGE_AJAX',array( 'URL' => admin_url( 'admin-ajax.php' ) ) );
	}

	

	function tour_package_register_widget(){

		register_sidebar(
			array(
				'name'          => __( 'Feature Package', 'itfosters' ),
				'id'            => 'feature_package',
				'description'   => __( 'Add widgets here to appear in page.', 'itfosters' ),
				'before_widget' => '',
				'after_widget'  => '',
				'before_title'  => '',
				'after_title'   => ''
			)
		);

		register_widget( 'PackageCatBlock_Widget' );		
				
	}


	function tour_package_init()
	{

		if(!headers_sent() && !session_id()) {
			session_start();
		}

		
		
		$labels = array(
			'name'               => _x( 'Tour Package', 'post type general name', 'itf-tour_package' ),
			'singular_name'      => _x( 'Tour Package', 'post type singular name', 'itf-tour_package' ),
			'menu_name'          => _x( 'Tour Package', 'admin menu', 'itf-tour_package' ),			
			'add_new'            => _x( 'Add New', 'Tour Package', 'itf-tour_package' ),
			'add_new_item'       => __( 'Add New Tour Package', 'itf-tour_package' ),
			'new_item'           => __( 'New Tour Package', 'itf-tour_package' ),
			'edit_item'          => __( 'Edit Tour Package', 'itf-tour_package' ),
			'view_item'          => __( 'View Tour Package', 'itf-tour_package' ),
			'all_items'          => __( 'All Tour Package', 'itf-tour_package' ),
			'search_items'       => __( 'Search Tour Package', 'itf-tour_package' ),			
			'not_found'          => __( 'No Tour Package found.', 'itf-tour_package' ),
			'not_found_in_trash' => __( 'No Tour Package found in Trash.', 'itf-tour_package' )
			);

			$args = array(
				'labels'             => $labels,
				'public'             => true,
				'publicly_queryable' => true,
				'show_ui'            => true,
				'show_in_menu'       => true,
				'query_var'          => true,
				'rewrite'            => array( 'slug' => 'tour-package' ),
				'capability_type'    => 'post',
				'has_archive'        => true,
				'hierarchical'       => false,
				'menu_position'      => null,
				'supports'           => array( 'title', 'thumbnail', 'excerpt','editor'),
				'register_meta_box_cb' => array($this,'add_tour_package_metaboxes'),		
				);
			register_post_type( 'itfpackage', $args );

			$labels = array(
				'name'                       => _x( 'Tour Type', 'taxonomy general name' ),
				'singular_name'              => _x( 'Tour Type', 'taxonomy singular name' ),
				'search_items'               => __( 'Search Tour Type' ),
				'all_items'                  => __( 'All Tour Type' ),
				'edit_item'                  => __( 'Edit Tour Type' ),
				'update_item'                => __( 'Update Tour Type' ),
				'add_new_item'               => __( 'Add New Tour Type' ),
				'new_item_name'              => __( 'New Tour Type Name' ),
				'not_found'                  => __( 'No tour type found.' ),
				'menu_name'                  => __( 'Tour Type' ),
			);
			$args = array(
				'hierarchical'          => true,
				'labels'                => $labels,
				'show_ui'               => true,
				'show_admin_column'     => true,
				'query_var'             => true,
				'rewrite'               => array( 'slug' => 'dealtype' ),
			);
			register_taxonomy( 'itftourtype', 'itfpackage', $args );

			//Order Listing

			$labels = array(
				'name'               => _x( 'Order', 'post type general name', 'itf-tour_package' ),
				'singular_name'      => _x( 'Order', 'post type singular name', 'itf-tour_package' ),
				'menu_name'          => _x( 'Order', 'admin menu', 'itf-tour_package' ),			
				'add_new'            => _x( 'Add New', 'Order', 'itf-tour_package' ),
				'add_new_item'       => __( 'Add New Order', 'itf-tour_package' ),
				'new_item'           => __( 'New Order', 'itf-tour_package' ),
				'edit_item'          => __( 'Edit Order', 'itf-tour_package' ),
				'view_item'          => __( 'View Order', 'itf-tour_package' ),
				'all_items'          => __( 'All Order', 'itf-tour_package' ),
				'search_items'       => __( 'Search Order', 'itf-tour_package' ),			
				'not_found'          => __( 'No Order found.', 'itf-tour_package' ),
				'not_found_in_trash' => __( 'No TOrder found in Trash.', 'itf-tour_package' )
				);
	
				$args = array(
					'labels'             => $labels,
					'public'             => true,
					'publicly_queryable' => false,
					'show_ui'            => true,
					'show_in_menu'       => "edit.php?post_type=itfpackage",
					'query_var'          => false,
					//'rewrite'            => array( 'slug' => 'tour-orders' ),
					'capability_type'    => 'post',
					'has_archive'        => false,
					'hierarchical'       => false,
					'menu_position'      => 1,
					'capabilities' => array('create_posts' => 'do_not_allow',),
					'map_meta_cap' => true,
					'supports'           => array('author'),
					'register_meta_box_cb' => array($this,'add_tour_order_metaboxes'),		
					);
				register_post_type( 'itftourorder', $args );

	}	
	
	function add_tour_order_metaboxes(){
		add_meta_box( 'tour-order-user-id', 'Booking Information', array($this,'itf_tour_order_user'), 'itftourorder', 'normal', 'default' );
		add_meta_box( 'tour-packet-info-id', 'Tours Package formation', array($this,'itf_tour_order_package'), 'itftourorder', 'normal', 'default' );
		add_meta_box( 'tour-travelers-id', 'Travelers iformation', array($this,'itf_tour_order_traveler'), 'itftourorder', 'normal', 'default' );
	}

	function itf_tour_order_user(){
		global $post;

		$firstName = get_post_meta($post->ID, 'firstName', true);
		$lastName = get_post_meta($post->ID, 'lastName', true);
		$useremail = get_post_meta($post->ID, 'useremail', true);
		$phonenumber = get_post_meta($post->ID, 'phonenumber', true);
		$hotelname = get_post_meta($post->ID, 'hotelname', true);
		$hoteladdress = get_post_meta($post->ID, 'hoteladdress', true);
		$pickup_address = get_post_meta($post->ID, 'pickup_address', true);
		$town_city = get_post_meta($post->ID, 'town_city', true);
		$zip = get_post_meta($post->ID, 'zip', true);
		$tour_date = get_post_meta($post->ID, 'tour_date', true);
		$paymentMethod = get_post_meta($post->ID, 'paymentMethod', true);
		$transactionid = get_post_meta($post->ID, 'transactionid', true);
		$paymentStatus = get_post_meta($post->ID, 'paymentStatus', true);

		$additional_info = get_post_meta($post->ID, 'additional_info', true);



		echo '<div class="row_full"> <h1>Order #'.$post->ID.' details</h1></div>
			  <div class="row_full"> <h4>Payment confirm by  '.$paymentMethod.', Transaction Id : '.$transactionid.', Payment status : '.$paymentStatus.' </h4></div>
			  <div class="row_full">
				<div class="rows_half">
					<label class="labelnames">Name</label>
					<div class="widefats">: '.$firstName.' '. $lastName .'</div>
				</div>
				<div class="rows_half">
					<label class="labelnames" >Email</label>
					<div class="widefats">: '.$useremail .'</div>
				</div>
			</div>
			<div class="row_full">
				<div class="rows_half">
					<label class="labelnames" >Phone</label>
					<div class="widefats">: '.$phonenumber .'</div>
				</div>
				<div class="rows_half">
					<label class="labelnames" >Tour Date</label>
					<div class="widefats">: '.$tour_date .'</div>
				</div>
			</div>
			<hr>
			<div class="row_full">
				<div class="rows_half">
					<label class="labelnames" >Hotel Name</label>
					<div class="widefats">: '.$hotelname .'</div>
				</div>
				<div class="rows_half">
					<label class="labelnames" >Hotel Address</label>
					<div class="widefats">: '.$hoteladdress .'</div>
				</div>
			</div>
			<div class="row_full">
				<div class="rows_half">
					<label class="labelnames" >Pick Up Address</label>
					<div class="widefats">: '.$pickup_address .'</div>
				</div>
				<div class="rows_half">
					<label class="labelnames" >City and Pin</label>
					<div class="widefats">: '.$town_city.' '.$zip.'</div>
				</div>
			</div>
			<div class="row_full">
			<label class="labelnames" >Additional Info</label>
			<div class="widefats">: '.$additional_info .'</div>
			</div>';
	}

	function itf_tour_order_package(){
		global $post;

		$totalprice = get_post_meta($post->ID, 'totalprice', true);
		$discount = get_post_meta($post->ID, 'discount', true);
		$grandtotal = get_post_meta($post->ID, 'grandtotal', true);
		$packages = get_post_meta($post->ID, 'packages', true);

		//print_r($packages);

		
		
		echo "<style>div#authordiv{display:none;}</style>";
		//foreach($packages as $packagerow)
		echo '<div class="row_full">';
		echo '<table cellpadding="5" cellspacing="0"  class="bookingtbl" width="100%">
                    <thead><tr>
                      <th align="left">'.$packages["title"].' <span class="tours_option_name">('.$packages["option_name"].')'.'</span></th>
					  <th align="right">Cost</th>
                      <th align="right">Qty</th>
                      <th align="right">Total</th>
                  </tr></thead><tbody>';
			  foreach( $packages["attribute"] as $attrow){
				  if($attrow["qty"]>0)
				  echo '<tr>
                      <td >'.$attrow["title"].'</td>
                      <td align="right" width="10%">$'.$attrow["price"].'</td>
					  <td align="right" width="10%">x '.$attrow["qty"].'</td>
                      <td align="right" width="15%">$'.$attrow["total"].'</td>
                  </tr>';
				}

				echo '</tbody><tfoot class="tourfooter"><tr>
                      <td align="right" colspan="3">Subtotal :</td>
                      <td align="right" width="15%"><strong>$'.$totalprice.'</strong></td>
                  	</tr>
					  <tr>
                      <td align="right" colspan="3">Discount :</td>
                      <td align="right" width="15%"><strong>$'.$discount.'</strong></td>
                  	</tr>
					  <tr>
                      <td align="right" colspan="3">Grand Total :</td>
                      <td align="right" width="15%"><strong>$'.$grandtotal.'</strong></td>
                  	</tr></tfoot>';
		echo  '</table>';
		echo '</div>';

	}

	function itf_tour_order_traveler(){
		global $post;

		$travelers = get_post_meta($post->ID, 'travelers', true);
		echo '<div class="row_full">';
		foreach($travelers as $kk=> $traveluser){
			echo '<div class="rows_full_screen">
					<div class="rows_halfscreen">
					<label class="alabelnames">#   '.($kk+1).'&nbsp;&nbsp;&nbsp;&nbsp; Name</label>
					<div class="widefats">: '.$traveluser["name"].'</div>
					</div>
					<div class="rows_halfscreen">
					<label class="alabelnames">Age</label>
					<div class="widefats">: '.$traveluser["age"].'Yrs</div>
					</div>
				</div>';
		}
				
		echo '</div>';
	}



	
	function add_tour_package_metaboxes(){
		add_meta_box( 'tour-package-meta-box-id', 'Tour Information', array($this,'itf_tour_package_box_cb'), 'itfpackage', 'normal', 'default' );
	}

	function itf_tour_package_box_cb(){
	
		global $post;

		echo '<input type="hidden" name="tour_package_meta_noncename" id="tour_package_meta_noncename" value="' . 
		wp_create_nonce( plugin_basename(__FILE__) ) . '" />';
		$carprice = get_post_meta($post->ID, 'price', true);
		$price_child = get_post_meta($post->ID, 'price_child', true);
		$extra_person_price = get_post_meta($post->ID, 'extra_person_price', true);
		$guide_price = get_post_meta($post->ID, 'guide_price', true);
		$enterance_price = get_post_meta($post->ID, 'enterance_price', true);
		$lunch_price = get_post_meta($post->ID, 'lunch_price', true);
		echo '<div class="row_full">
				<div class="rows_half">
					<label class="labelname" for="price">Car Price:</label>
					<input type="text" id="price" name="price" value="' . $carprice  . '" class="widefat" />
				</div>
				<div class="rows_half">
					<label class="labelname" for="price">Car Child Price (5-11 Years):</label>
					<input type="text" id="price_child" name="price_child" value="' . $price_child  . '" class="widefat" />
				</div>
			</div>
			<div class="row_full">
			<div class="rows_half">
			<label class="labelname" for="price">Any Additional Person Price for Solo:</label>
			<input type="text" id="extra_person_price" name="extra_person_price" value="' . $extra_person_price  . '" class="widefat" />
			</div>

			<div class="rows_half">
			<label class="labelname" for="price">Guide Charge:</label>
			<input type="text" id="guide_price" name="guide_price" value="' . $guide_price  . '" class="widefat" />
			</div>
			
			</div>
			<div class="row_full">

			<div class="rows_half">
			<label class="labelname" for="price">Enterance Charge:</label>
			<input type="text" id="enterance_price" name="enterance_price" value="' . $enterance_price  . '" class="widefat" />
			</div>

			<div class="rows_half">
			<label class="labelname" for="price">Lunch Charge:</label>
			<input type="text" id="lunch_price" name="lunch_price" value="' . $lunch_price  . '" class="widefat" />
			</div>
			</div>
			';
		
	}
	
	
	function itf_save_post_tour_package_meta($post_id, $post) {
		if(!isset($_POST['tour_package_meta_noncename'])) return $post->ID;

		if ( !wp_verify_nonce( $_POST['tour_package_meta_noncename'], plugin_basename(__FILE__) )) {
		return $post->ID;
		}

		if ( !current_user_can( 'edit_post', $post->ID ))
			return $post->ID;
		
		$events_meta['price'] = isset($_POST['price'])?$_POST['price']:"";
		$events_meta['price_child'] = isset($_POST['price_child'])?$_POST['price_child']:"";
		$events_meta['extra_person_price'] = isset($_POST['extra_person_price'])?$_POST['extra_person_price']:"";
		$events_meta['guide_price'] = isset($_POST['guide_price'])?$_POST['guide_price']:"";
		$events_meta['enterance_price'] = isset($_POST['enterance_price'])?$_POST['enterance_price']:"";
		$events_meta['lunch_price'] = isset($_POST['lunch_price'])?$_POST['lunch_price']:"";
		
		foreach ($events_meta as $key => $value) { 
			if( $post->post_type == 'revision' ) return;
			$value = implode(',', (array)$value); 
			if(get_post_meta($post->ID, $key, FALSE)) {
				update_post_meta($post->ID, $key, $value);
			} else { 
				add_post_meta($post->ID, $key, $value);
			}
			if(!$value) delete_post_meta($post->ID, $key);
		}
	}



	public static function itf_get_featured_image($post_ID="",$imagesize="thumbnail") {
	    $post_thumbnail_id = get_post_thumbnail_id($post_ID);

	    if ($post_thumbnail_id) {
	        $post_thumbnail_img = wp_get_attachment_image_src($post_thumbnail_id, $imagesize);
	        return $post_thumbnail_img[0];
	    }else
	    return ITF_TOUR_PACK_URL.'images/default.jpeg';
	}

	public static function isFeaturedImage($post_ID="") {
	    $post_thumbnail_id = get_post_thumbnail_id($post_ID);
	    return ($post_thumbnail_id)?true:false;
	}

}

new ITFTourPackage();
