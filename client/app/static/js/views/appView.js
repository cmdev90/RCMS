(function (document, window, $, Backbone, _){



	RCMS.Views.App = Backbone.View.extend({

		className : "row",

		initialize : function(){
			this.render();
		},

		render : function(){
			$(this.el).html(this.template(this.model));	
			return this;
		}

	});


	RCMS.Views.Settings = Backbone.View.extend({

		className : "row",

		initialize : function(){
			this.render();
		},

		render : function(){
			$(this.el).html(this.template(this.model));	
			return this;
		},

		events :{
			"submit #delete-user-app" : "deleteApp",
			"submit #update-user-app" : "updateApp"
		},


		deleteApp : function(e){
			var app = new RCMS.Models.ApplicationModel(),
			data = this.getFormData("#delete-user-app");
			app.url = '/delete/user/app/'+ data.partition +'/'+ data.appId;
			
			$('#deleteAppModal').modal("hide").on('hidden.bs.modal', function (e) {
			  	$('input[type=text],input[type=password]').val('');
			});

			app.fetch({
				success : function(model, response){
					$.jStorage.set('app_count', response.count);
					window.location.hash = "";
				},
				error : function(model, response){									  
				  	swal("Oops...", "Something went wrong, Please Try again!", "error");
					console.log(response);
				}
			});
			return false;
		},

		updateApp : function(e){

			var app = new RCMS.Models.ApplicationModel(),
			data = this.getFormData("#update-user-app");
			app.url = "/update/user/package";
			
			$('#updateAppModal').modal("hide").on('hidden.bs.modal', function (e) {
			  	$('input[type=text],input[type=password]').val('');
			});

			app.save(data,{
				success : function(model, response){
					swal("Success", "Application Package Updated", "success");
				},
				error : function(model, response){									  
				  	swal("Oops...", "Something went wrong, Please Try again!", "error");
					console.log(response);
				}
			});
			
			return false;
		},

		getFormData : function(id){			
			var data = {
				"partition" : $.jStorage.get("email")
			},
			form = this.$el.find(id),

			viewArr = form.serializeArray();			
			$.each(viewArr, function(i,d){
				data[viewArr[i].name] = viewArr[i].value;
			});			
			return data;
		}

	});

	
}(document, this, jQuery, Backbone, _));			