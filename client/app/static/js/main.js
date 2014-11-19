
(function (document, window, $, Backbone, _){
	

	RCMS.Routers.AppRouter = Backbone.Router.extend({

		routes: {
			"" 					: "home",			
			"usage"				: "usage",
			"register"			: "register"
		},

		initialize : function(){
			console.log("initialize");	
			this.authen = new RCMS.Views.AuthenticationView({model:new RCMS.Models.AuthenticationModel()});
			$("#rcms-body").html(this.authen.el);	
		},

		home : function(){	

			if($.jStorage.get('apiKey')){	

				this.authen.selectMenuItem('home');

				this.defaultPackage = new RCMS.Models.PackagesModel();
				this.defaultPackage.url = '/get/user/package/'+ $.jStorage.get('package');

				this.defaultPackage.fetch({
					success : function(model, response){																											
						$.each(response.package, function(i, data){
							this.home = new RCMS.Views.Home({model:data});
							$("#rcms-body").html(this.home.el);	
						});						
					},
					error : function(model, response){
						console.log(response);				
					}
				});
				

			}else{
				this.authen = new RCMS.Views.AuthenticationView({model:new RCMS.Models.AuthenticationModel()});
				$("#rcms-body").html(this.authen.el);
			}
		},

		usage : function(){
			if($.jStorage.get('apiKey')){
				this.authen.selectMenuItem('usage');
				swal({
						title: "Hey!!",
						text: "Good Things come to those who wait..",
						imageUrl: 'img/uc.png'
					},
				function(){
					window.location.hash = "";								
				});				
			}else{
				this.authen = new RCMS.Views.AuthenticationView({model:new RCMS.Models.AuthenticationModel()});
				$("#rcms-body").html(this.authen.el);
			}
		},

		register : function(){
			if($.jStorage.get('apiKey')){
				window.location.hash = "";				
			}else{
				this.register = new RCMS.Views.Register({model:new RCMS.Models.Register()});
				$("#rcms-body").html(this.register.el);	
			}	
		}

	});

	RCMS.templateLoader.load(["Login", "Register", "Home", "Package"],function () {      
		$(document).ready(function(){
			app = new RCMS.Routers.AppRouter();
			Backbone.history.start();
		});
	});


}(document, this, jQuery, Backbone, _));