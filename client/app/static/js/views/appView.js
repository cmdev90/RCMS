(function (document, window, $, Backbone, _){



	RCMS.Views.App = Backbone.View.extend({

		className : "row",

		initialize : function(){
			this.render();
		},

		render : function(){
			$(this.el).html(this.template(this.model));	
			this.popluateCharts(10);
			return this;
		},

		popluateCharts : function(offset){
			this.hide();
			var collection = new RCMS.Collections.UsageCollection()
			dataset = {},
			stats1 = this.$el.find("#stats1"),
			stats2 = this.$el.find("#stats2"),
			stats3 = this.$el.find("#stats3"),			
			that = this;


			collection.fetch({
				url : '/get/user/app/usage/'+this.model.id + '/'+ offset,
				success : function(col, response){
					if(response.usage.length > 0){
						dataset = RCMS.Chart.parseData(response.usage);					  
						RCMS.Chart.genChart(stats1, "Packet Length Over Time", "Incoming Packets", dataset.inTime, "Packets (byte)", dataset.inPacketLength, "Incoming");
						RCMS.Chart.genChart(stats2, "Packet Length Over Time", "OutGoing Packets", dataset.outTime, "Packets (byte)", dataset.outPacketLength, "OutGoing");
						RCMS.Chart.genChart(stats3, "Incoming Vs Outgoing", "Packets", dataset.transmission, "Packets (byte)", dataset.packets, "Transmission");
					}else{						
						RCMS.Chart.genChart(stats1, "Packet Length Over Time", "Incoming Packets", RCMS.Chart.defaultArr, "Packets (byte)", RCMS.Chart.defaultArr, "Incoming");
						RCMS.Chart.genChart(stats2, "Packet Length Over Time", "OutGoing Packets", RCMS.Chart.defaultArr, "Packets (byte)", RCMS.Chart.defaultArr, "OutGoing");
						RCMS.Chart.genChart(stats3, "Incoming Vs Outgoing", "Packets", RCMS.Chart.defaultStrArr, "Packets (byte)", RCMS.Chart.defaultArr, "Transmission");
					}					
					that.show();
				}, 
				error : function(col, response){
					console.log(response);
					that.show();
				}
			});

		},

		events : {
			"change #offset-form" : "changeGraphs"
		},

		changeGraphs : function(e){
			var that = this,
			form = this.$el.find("#offset-form"),
			offset = this.getFormData(form).offset;
			this.popluateCharts(offset);
		},

		getFormData : function(id){			
			var data = {},
			form = this.$el.find(id),
			viewArr = form.serializeArray();			

			$.each(viewArr, function(i,d){
				data[viewArr[i].name] = viewArr[i].value;				
			});		
			return data;
		},

		hide : function(){
			$("#content").hide();
			$("#loading").show();			
		},

		show : function(){
			$("#content").show();
			$("#loading").hide();			
		}

	});


	RCMS.Views.Settings = Backbone.View.extend({

		className : "row",

		initialize : function(){
			this.render();
		},

		render : function(){
			$(this.el).html(this.template(this.model));	
			this.hide();
			var app = new RCMS.Models.ApplicationModel(),
			data = this.getFormData("#delete-user-app"),
			that= this,
			app_panel = this.$el.find("#change-app-settings");

			app.url = '/get/user/package/'+ $.jStorage.get('email') +'/'+ this.model.id;
			app.fetch({
				success : function(model, response){
					console.log(response);
					$(app_panel).prepend(new RCMS.Views.SinglePackage({model:response.package[0]}).el);
					that.show();
				},
				error : function(model, response){
					console.log(response);
					that.show();
				}
			});

			return this;
		},

		events :{
			"submit #delete-user-app" : "deleteApp",
			"submit #update-user-app" : "updateApp"
		},


		deleteApp : function(e){
			var app = new RCMS.Models.ApplicationModel(),
			data = this.getFormData("#delete-user-app"),
			that= this;
			app.url = '/delete/user/app/'+ data.partition +'/'+ data.appId;
			
			if(!_.isEmpty(data)){

				$('#deleteAppModal').modal("hide").on('hidden.bs.modal', function (e) {
				  	$('input[type=text],input[type=password]').val('');
				  	that.hide();
				});

				app.fetch({
					success : function(model, response){
						that.show();
						$.jStorage.set('app_count', response.count);
						window.location.hash = "";
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
			}else{
				swal("Oops...", "Looks Like You Left Some Fields Empty", "warning");
			}
			return false;
		},

		updateApp : function(e){

			var app = new RCMS.Models.ApplicationModel(),
			data = this.getFormData("#update-user-app")
			that = this,
			curr_package = $("#package-type").html().toLowerCase();
			app.url = "/update/user/package";
			console.log($("#package-type").html().toLowerCase() +" "+data.package_type);

			if(curr_package !== data.package_type){

				$('#updateAppModal').modal("hide").on('hidden.bs.modal', function (e) {
				  	$('input[type=text],input[type=password]').val('');
				  	that.hide();
				});

				app.save(data,{
					success : function(model, response){
						that.show();					
						swal({
								title: "Success!!",
								text: "Package Updated!",
								type: "success"
							},
						function(){						
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
			}else{
				swal("Oops...", "Looks Like You Have Choosen Your Current Package", "warning");
			}

			return false;
		},

		getFormData : function(id){			
			var data = {
				"partition" : $.jStorage.get("email")
			},
			form = this.$el.find(id),
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
		}

	});


	RCMS.Views.SinglePackage = Backbone.View.extend({

		className : "col-xs-6 col-md-6",

		initialize : function(){
			this.render();
		},

		render : function(){
			$(this.el).html(this.template(this.model));	
			return this;
		}

	});

	
}(document, this, jQuery, Backbone, _));			