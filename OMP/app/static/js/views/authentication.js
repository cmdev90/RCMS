

(function (document, window, $, Backbone, _){


	RCMS.Views.AuthenticationView = Backbone.View.extend({

		initialize: function(){	
			this.model.bind('change:loggedIn', this.render, this);		
			this.render();
		},							

		render: function(){

			if (this.model.get('loggedIn')) {
				$("#logout_action").html(new RCMS.Views.Logout({model:this.model}).el);	            	            				
	        } else {
	            this.$el.html(new RCMS.Views.Login().el);	
	            $("#logout_action").html('');            
	        }
	        return this;	        
		},

		events : {
			'submit #login' : 'authen'
		},

		authen : function(){	
			var that = this,
			data = this.getFormData();
			if(!_.isEmpty(data)){
				this.hide();
				this.model.url = "/user/login";

				this.model.save(data,{
					success:function(model, response){
						console.log(response);

						var user = response.user;
						that.model.setApiKey(user.PartitionKey+"_"+user.RowKey);
						that.model.setUser(user);
						that.show();					
						window.location.reload();
					},
					error : function(model, response){
						console.log(response);
						that.show();
						swal("Oops...", "Something went wrong, Please Try again!", "error");
					}
				});
				$('input[type=text],input[type=password]').val('');	
			}else{
				swal("Oops...", "Looks Like You Left Some Fields Empty", "warning");
			}
			
			return false;
		},		

		getFormData : function(){			
			var data = {},
			form = this.$el.find("#login"),
			viewArr = form.serializeArray(),
			valid = true;			

			$.each(viewArr, function(i,d){
				data[viewArr[i].name] = viewArr[i].value;
				if(viewArr[i].value === "") valid = false;
			});		
			if(valid){
				return data;
			}else{
				return {};
			}
		},

		hide : function(){
			$("#content").hide();
			$("#loading").show();			
		},

		show : function(){
			$("#content").show();
			$("#loading").hide();			
		},

		selectMenuItem: function (menuItem) {
	        $('.nav-pills li').removeClass('active');
	        if (menuItem) {
	            $('.' + menuItem).addClass('active');
	        }
	    }
	});


	RCMS.Views.Login = Backbone.View.extend({

		className : 'row',

		initialize: function(){			
			this.render();
		},		
		
		render: function(){							 
			$(this.el).html(this.template());				
	        return this;
		}
	});


	RCMS.Views.Logout = Backbone.View.extend({

		tagName : 'li',

		initialize : function(){
			this.render();
		},

		render : function(){
			$(this.el).html('<a id = "user_logout">Logout</a>');	              	              

	        return this;
		},

		events:{
			"click #user_logout":  "click"
		},

		click : function(){			
			this.hide();
			this.model.setApiKey(null);				
			window.location.reload();
		},

		hide : function(){
			$("#content").hide();
			$("#loading").show();			
		},

		show : function(){
			$("#content").show();
			$("#loading").hide();			
		},
	});


	RCMS.Views.Register = Backbone.View.extend({

		className : 'row',

		initialize: function(){			
			this.render();
		},		
		
		render: function(){							 
			$(this.el).html(this.template());				
	        return this;
		},

		events : {
			'submit #reg' : 'register'
		},

		register : function(){	
			var that = this,
			data = this.getFormData();
			
			if(!_.isEmpty(data)){
				this.hide();			

				this.model.save(data,{
					success:function(model, response){
						console.log(response);
						that.show();	
						swal({
								title: "Success!!",
								text: "Your Account has been created, Prepare for Awesomeness!",
								type: "success"
							},
						function(){
							window.location.hash = "";	
							window.location.reload();							
						});				
					},
					error : function(model, response){
						console.log(response);
						that.show();
						swal({
								title: "Oops...",
								text: "Something went wrong, Please Try again!",
								type: "error"
							},
						function(){
							window.location.reload();	
						});	
											
					}
				});
				$('input[type=text],input[type=password]').val('');
			}else{
				swal("Oops...", "Looks Like You Left Some Fields Empty", "warning");
			}
			
			return false;
		},		

		getFormData : function(){			
			var data = {},
			form = this.$el.find("#reg"),
			viewArr = form.serializeArray(),
			valid = true;			

			$.each(viewArr, function(i,d){
				data[viewArr[i].name] = viewArr[i].value;
				if(viewArr[i].value === "") valid = false;
			});		
			if(valid){
				return data;
			}else{
				return {};
			}
		},

		hide : function(){
			$("#content").hide();
			$("#loading").show();			
		},

		show : function(){
			$("#contentx").show();
			$("#loading").hide();			
		}
	});



}(document, this, jQuery, Backbone, _));		