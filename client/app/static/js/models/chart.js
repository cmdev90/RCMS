(function (document, window, $, Backbone, _){

    RCMS.Chart = {

        defaultArr : [0,0,0,0,0,0,0,0,0,0,0,0],

        defaultStrArr : [
                "transmission", "transmission","transmission",
                "transmission","transmission","transmission",
                "transmission","transmission","transmission",
                "transmission","transmission","transmission"],

        addZero : function (i) {
            if (i < 10) {
                i = "0" + i;
            }
            return i;
        },

        convertTime : function(date){
            var d = new Date(date);    
            var h = RCMS.Chart.addZero(d.getHours());
            var m = RCMS.Chart.addZero(d.getMinutes());
            var s = RCMS.Chart.addZero(d.getSeconds());
            return h + ":" + m + ":" + s;
            // return h + ":" + m;
        },


        parseData : function(data){
            var inTime = [],
            outTime = [],
            incoming = [],
            outgoing = [],
            inPacketLength = [],
            outPacketLength = [],
            transmission = [],
            packets = [],
            dataset = {};

            $.each(data, function(index, d){
                var date = RCMS.Chart.convertTime(d['timestamp']);
                packets.push(parseInt(d['length']));
                transmission.push(d['transmission']);

                if(d['transmission'] === 'incoming'){
                    inTime.push(date);
                    incoming.push(d['transmission']);
                    inPacketLength.push(parseInt(d['length']));
                }else{
                    outTime.push(date);
                    outgoing.push(d['transmission']);
                    outPacketLength.push(parseInt(d['length']));

                }                
            });
            dataset = {
                "inTime"            : inTime,
                "incoming"          : incoming,
                "inPacketLength"    : inPacketLength,
                "outTime"           : outTime,
                "outgoing"          : outgoing,
                "outPacketLength"   : outPacketLength,
                "packets"           : packets,
                "transmission"      : transmission
            };
            return dataset;
          
        },

         genChart : function(id, titleTx, subtitleTx, xAxisD, yAxisD, seriesD1, seriesName1){
        // genChart : function(id){
        
            $(id).highcharts({
                chart: {
                    type: 'spline'
                },
                title: {
                    text: titleTx
                },
                subtitle: {
                    text: subtitleTx
                },
                xAxis: {
                    categories: xAxisD
                },
                yAxis: {
                    title: {
                        text: yAxisD
                    }
                },
                plotOptions: {
                    spline: {
                        marker: {
                            radius: 4,
                            lineColor: '#666666',
                            lineWidth: 1
                        }
                    }
                },
                series: [{
                    name: seriesName1,
                    data: seriesD1
                }]
            });
         }
    }

}(document, this, jQuery, Backbone, _));                