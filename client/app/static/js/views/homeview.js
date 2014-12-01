(function (document, window, $, Backbone, _){



	RCMS.Views.Home = Backbone.View.extend({

		className : "row",

		initialize : function(){
			this.render();
		},

		render : function(){
			
			this.$el.html(this.template());			
			this.listApps(this.$el.find("#rcms-app-list"));
			this.$el.find("#app-count").html("App Count: "+$.jStorage.get('app_count'));
			return this;
		},

		events : {
			"click .new-app-btn" : "populateLocations",
			"submit #app-form"	: "newApp"
		},

		listApps : function(body){
			var app = new RCMS.Models.ApplicationModel();
			app.url = '/get/user/applications/'+ $.jStorage.get('email');
			console.log(app.url);
			app.fetch({
				success : function(model, response){
					$.each(response.applications, function(index, data){
						$(body).append(new RCMS.Views.AppRow({model:data}).el);
					});
				},
				error : function(model, response){
					console.log(response);
				}
			});
		},


		populateLocations : function(e){
			if(parseInt($.jStorage.get('app_count')) >= 5){
				swal("Attention", "By continuing you will agree to pay an additional one time fee for new apps", "warning");
			}
			var locations = new RCMS.Collections.LocationsCollection(),
			that = this,
			list = that.$el.find('#reigon');
			locations.fetch({
				success : function(model, response){																					
					$.each(model.toJSON()[0].locations, function(index,data){
						list.append('<option value = "'+data.name+'">'+data.name+'</option>');
					});			
				},
				error : function(model, response){
					console.log(response);							
				}
			});
			$('#appModal').on('hidden.bs.modal', function (e) {
			  	list.html("");
			});
		},

		newApp : function(){
			var app = new RCMS.Models.ApplicationModel(),
			list = this.$el.find('#reigon');

			app.save(this.getFormData(),{
				success:function(model, response){
					console.log(response);
											
					$('#appModal').modal("hide").on('hidden.bs.modal', function (e) {
					  	list.html("");
					  	$.jStorage.set('app_count', response.count);					  	
					  	window.location.reload();
					});					
					
				},
				error : function(model, response){
					console.log(response);
					$('#appModal').modal("hide").on('hidden.bs.modal', function (e) {
					  	list.html("");
					  	swal("Oops...", "Something went wrong, Please Try again!", "error");
					});					
				}
			});
			$('input[type=text],input[type=password]').val('');
			console.log(this.getFormData());			
			return false;
		},

		getFormData : function(){			
			var data = {
				"partition" : $.jStorage.get("email"),				
			},
			form = this.$el.find("#app-form"),

			viewArr = form.serializeArray();			
			$.each(viewArr, function(i,d){
				data[viewArr[i].name] = viewArr[i].value;
			});			
			return data;
		}
	});

	RCMS.Views.AppRow = Backbone.View.extend({

		tagName : "tr",

		initialize : function(){
			this.render();
		},

		render : function(){
			$(this.el).html(this.template(this.model));	
			return this;
		}

	});

	RCMS.Views.Applications = Backbone.View.extend({

		className : "row",

		initialize : function(){
			
			this.render();
		},

		render : function(){

			$(this.el).html(this.template(this.model));	
			this.$el.find("#key").html("Acess Token: "+$.jStorage.get('key'));
			this.$el.find("#port").html("Port: "+$.jStorage.get('port'));
			this.packages(this.$el.find("#accordion"));
	        return this;
		},

		packages : function(id){
			var pkgCol = new RCMS.Collections.PackagesCollection(),
			that = this;
			that.hide();
			pkgCol.fetch({
				success : function(model, response){																					
					$.each(response.packages, function(index, data){
						$.each(data, function(i,d){							
							$(id).append(new RCMS.Views.Package({model:data[i]}).el);
						});
					});
					that.show();								
				},
				error : function(model, response){
					console.log(response);
					that.show();	
					window.location.reload();				
				}
			});
		},

		hide : function(){
			$("#rcms-body").hide();
			$("#loading").show();			
		},

		show : function(){
			$("#rcms-body").show();
			$("#loading").hide();			
		}
	});


	RCMS.Views.Package = Backbone.View.extend({					

		className : 'panel panel-default',

		initialize: function(){	

			this.render();
		},		
		
		render: function(){				
			$(this.el).html(this.template(this.model));	
	        return this;
		},

		events : {
			'click .pkg-select' : 'setPackage'
		},

		setPackage : function(e){			
			this.hide();
			var package = $(e.target).attr('data-name').toLocaleLowerCase(),
			nodes = $(e.target).attr('data-node'),
			data = {},
			that = this,
			pkg = new RCMS.Models.PackagesModel();
			pkg.url = '/update/user/package';

			if (package === $.jStorage.get('package')) {
				this.show();
				swal("Note!", "This is your current package");								
			}else{
				data = {
					"email" 	: $.jStorage.get('email'),
					"password"	: $.jStorage.get('password'),
					"package"	: package
				};

				pkg.save(data,{
					success:function(model, response){	
						console.log(JSON.stringify(response));	
						$.jStorage.set('package', package);
						that.show();
						swal({
							title: "Upgraded!",
							text: "Your Your package has been upgraded!",
							type: "success"
						},
						function(){
							window.location.reload();							
						});													
					},
					error : function(model, response){
						console.log(JSON.stringify(response));										
						that.show();
					}
				});
			}
		},

		hide : function(){
			$("#rcms-body").hide();
			$("#loading").show();			
		},

		show : function(){
			$("#rcms-body").show();
			$("#loading").hide();			
		}
	});


}(document, this, jQuery, Backbone, _));			