var WUL_SID = "urn:antor-fr:serviceId:WakeUpLight1";
var WUL_TIMERS = "Timers";
var WUL_RampTime = "Ramp Time Min";

function get_timer_obj(deviceID){
    var timers = new Array();
    var Timers=get_device_state(deviceID,WUL_SID,WUL_TIMERS,1);
    // user timer number(ID); enabled; name(a-z,0-9);type; time; days; duration|
    
    var parts=Timers.split('|');
    var partsNo=parts.length;
    
    for(var i=0;i<partsNo;i++){
        if(trim(parts[i])!=''){
            var timerData=parts[i].split(';');
            if (timerData.length==7){
                var timerObj = {
                    "id":       parseInt(timerData[0]),
                    "enabled":  parseInt(timerData[1]),
                    "name":     timerData[2],
                    "type":     parseInt(timerData[3]),      
                    "duration": parseInt(timerData[6])
                }
                switch(parseInt(timerObj.type)){
                    case 1:
                        timerObj.interval= timerData[4];
                    break;
                    case 2:
                        timerObj.time= timerData[4];
                        timerObj.days_of_week = timerData[5];
                    break;
                    case 3:
                        timerObj.time= timerData[4];
                        timerObj.days_of_month = timerData[5];
                    break;
                    case 4:
                        timerObj.abstime= timerData[4];
                    break;
                }
                timers.push(timerObj);
            }
        }
    }
    
    return timers;
    
}

function set_timer_byId(timersObj,timerObj,timerID,deviceID){
    var find = false;
    for(var i=0;i<timersObj.length;i++){
        if (timersObj[i].id == timerID){
            find= true;
            timersObj[i]=timerObj;
            break;
        }
    }
    if(!find){
      timersObj.push(timerObj);  
    }
    if(deviceID){
        set_timer_obj(deviceID,timersObj)
    }
    return timersObj;
}

function set_timer_obj(deviceID,timersObj){

    // user timer number(ID), enabled, name(a-z,0-9),type, time, days, duration|
    
    var Timers = '';
    var nodeObj;
    
    for(var i=0;i<timersObj.length;i++){
        nodeObj = timersObj[i];
        if (isNaN(nodeObj.id)!==true) {
            Timers += nodeObj.id+';';
            Timers += nodeObj.enabled+';';
            Timers += nodeObj.name+';';
            Timers += nodeObj.type+';';
            switch(parseInt(nodeObj.type)){
                case 1:
                    Timers += nodeObj.interval+';;';
                break;
                case 2:
                    Timers += nodeObj.time+';';
                    Timers += nodeObj.days_of_week+';';
                break;
                case 3:
                    Timers += nodeObj.time+';';
                    Timers += nodeObj.days_of_month+';';
                break;
                case 4:
                    Timers += nodeObj.abstime+';;';
                break;
                default:
                    Timers += ';;';
                break;
            }
            Timers += nodeObj.duration+'|';
        }
    }
    set_device_state(deviceID,WUL_SID,WUL_TIMERS,Timers,1);
    set_device_state(deviceID,WUL_SID,WUL_TIMERS,Timers,0);
    
}

function WUL_edit_timer(deviceID,timerID){

    log_message('Wake Up Light Edit timer: '+deviceID);
    var timersObj
    
    var timersObj = get_timer_obj(deviceID);
    
    if (timerID) {
        timerObj = get_node_obj(timersObj,timerID);
    } else {
        
        timerID = get_new_timer_id(timersObj);
        
        var new_timer_id = timerID;
        var description = "New schedule";
        var timer_type=1;
        var DefaultRampTime=get_device_state(deviceID,WUL_SID,WUL_RampTime,1);
	
        timerObj = {
            "id":new_timer_id,
            "name":	description,
            "type":	timer_type,
            "enabled":1,
            "duration": DefaultRampTime
        }
        
        timersObj = set_timer_byId(timersObj,timerObj,timerID,deviceID);
        
    }
    
    
    
	var timerName=timerObj.name;
    var timerDuration=timerObj.duration;
	var timerValue='';
	
	var html='<table width="100%">'
	+ '<table style="padding_left:10px;" border="0" align="center" width="100%" class="m_table skinned-form-controls skinned-form-controls-mac">'
	+ '<tr>'
	+ '	<td>'+"Name for this timer"+'</td>'
	+ '	<td><input id="Name_Timer_'+deviceID+"_"+timerID+'" value="'+timerName+'" onChange="WUL_update_timer_values('+deviceID+','+timerID+')" type="text" style="width: 150px;"></td>'
 	+ '</tr>'
    + '<tr>'
    + '	<td>'+"Duration for this schedule (minutes)"+'</td>'
	+ '	<td><input id="Duration_Timer_'+deviceID+"_"+timerID+'" value="'+timerDuration+'" onChange="WUL_update_timer_values('+deviceID+','+timerID+')" type="text" style="width: 150px;"></td>'    
    + '</tr>';
 	
	var intervalValue='';
	var intervalType=1;
	if(timerObj.type==1 && timerObj.interval){
		timerValue=timerObj.interval;
		intervalValue=timerValue.substr(0,timerValue.length-1);
		intervalType=timerValue.substr(timerValue.length-1);
		intervalType=(intervalType=='m')?2:1;
	}
	html+='<tr>'
	+ '		<td colspan="2"></td>'
	+ '	</tr>'
	+ '	<tr>'
	+ '		<td><label><input type="radio" name="timedEventType_'+deviceID+'_'+timerID+'" id="timedEventType_'+deviceID+'_'+timerID+'_1" value="1" '+((timerObj.type=='1')?'checked':'')+' onClick="WUL_set_timer_option('+deviceID+','+timerID+',1);"> <span><B>'+"Interval based"+':</B></span></label></td>'
	+ '		<td>'+"Example: Do something every x minutes, or every other hour"+'</td>'
	+ '	</tr>'
	+ '	<tr>'
	+ '		<td colspan="2" id="type_1" style="display:'+((timerObj.type=='1')?'':'none')+';">'+"Every"+' <input type="text" id="intervalNumber_'+deviceID+'_'+timerID+'" value="'+intervalValue+'" size="2" onChange="WUL_update_timer_values('+deviceID+','+timerID+')">'
	+ '			<select name="intervalType" class="styled" id="intervalType_'+deviceID+'_'+timerID+'" onChange="WUL_update_timer_values('+deviceID+','+timerID+')" style="width:100px;">'
	+ '				<option value="1" '+((intervalType==1)?'selected':'')+'>'+"hours"+'</option>'
	+ '				<option value="2" '+((intervalType==2)?'selected':'')+'>'+"minutes"+'</option>'
	+ '			</select>'
	+ '		</td>'
	+ '	</tr>';

	var dayOfWeekTime='';
	var daysSelected=new Array();
	if(timerObj.type==2 && timerObj.time){
		dayOfWeekTime=timerObj.time;
		if(timerObj.days_of_week){
			daysSelected=timerObj.days_of_week.split(',');
		}
	}
	html+='<tr>'
	+ '		<td><label><input type="radio" name="timedEventType_'+deviceID+'_'+timerID+'" id="timedEventType_'+deviceID+'_'+timerID+'_2" value="2" '+((timerObj.type=='2')?'checked':'')+' onClick="WUL_set_timer_option('+deviceID+','+timerID+',2);"> <span><B>'+"Day of week based"+':</B></span></label></td>'
	+ '		<td>'+"Example: Do something at 7:00 on Monday and Wednesday, or 1 hour and 30 minutes before sunset on Fridays."+'</td>'
	+ '	</tr>'
	+ '	<tr>'
	+ '		<td colspan="2" id="type_2" style="display:'+((timerObj.type=='2')?'':'none')+';">'
	+ '<label><input type="checkbox" id="dayOfWeek_1_'+deviceID+'_'+timerID+'" onClick="WUL_update_timer_values('+deviceID+','+timerID+');" '+((daysSelected.in_array(1)?'checked':''))+'> '
	+ '<span>'+"Monday"+'</span></label>'
	+ '<label><input type="checkbox" id="dayOfWeek_2_'+deviceID+'_'+timerID+'" onClick="WUL_update_timer_values('+deviceID+','+timerID+');" '+((daysSelected.in_array(2)?'checked':''))+'> '
	+ '<span>'+"Tuesday"+'</span></label>'
	+ '<label><input type="checkbox" id="dayOfWeek_3_'+deviceID+'_'+timerID+'" onClick="WUL_update_timer_values('+deviceID+','+timerID+');" '+((daysSelected.in_array(3)?'checked':''))+'> '
	+ '<span>'+"Wednesday"+'</span></label>'
	+ '<input type="checkbox" id="dayOfWeek_4_'+deviceID+'_'+timerID+'" onClick="WUL_update_timer_values('+deviceID+','+timerID+');" '+((daysSelected.in_array(4)?'checked':''))+'> '
	+ '<span>'+"Thursday"+'</span>'
	+ '<label><input type="checkbox" id="dayOfWeek_5_'+deviceID+'_'+timerID+'" onClick="WUL_update_timer_values('+deviceID+','+timerID+');" '+((daysSelected.in_array(5)?'checked':''))+'> '
	+ '<span>'+"Friday"+'</span></label>'
	+ '<label><input type="checkbox" id="dayOfWeek_6_'+deviceID+'_'+timerID+'" onClick="WUL_update_timer_values('+deviceID+','+timerID+');" '+((daysSelected.in_array(6)?'checked':''))+'> '
	+ '<span>'+"Saturday"+'</span></label>'
	+ '<label><input type="checkbox" id="dayOfWeek_7_'+deviceID+'_'+timerID+'" onClick="WUL_update_timer_values('+deviceID+','+timerID+');" '+((daysSelected.in_array(7)?'checked':''))+'> '
	+ '<span>'+"Sunday"+'</span></label><br>'
	+ '<br><table cellpadding="0" cellspacing="0" border="0" width="100%">'
	+ '			<tr>'
	+ '				<td>'+WUL_timed_event_subtype('w',dayOfWeekTime,deviceID,timerID)+' '+WUL_event_time_picker('w',dayOfWeekTime,deviceID,timerID)+'</td>'
	+ '			</tr>'
	+ '		</table>'
	+ '		</td>'
	+ '	</tr>';
	
	var dayOfMonths='';
	var dayOfMonthTime='';
	if(timerObj.type==3 && timerObj.time){
		dayOfMonths=timerObj.days_of_month;
		dayOfMonthTime=timerObj.time;
	}
	html += '<tr>'
	+ '		<td><label><input type="radio" name="timedEventType_'+deviceID+'_'+timerID+'" id="timedEventType_'+deviceID+'_'+timerID+'_3" value="3" '+((timerObj.type=='3')?'checked':'')+' onClick="WUL_set_timer_option('+deviceID+','+timerID+',3);"> <span><B>'+"Day of month based"+':</B></span></label></td>'
    + '      <td>'+"Example: Do something at 8:00 on the 1st and 15th of each month"+'</td>'
	+ '	</tr>'
	+ '<tr>'
	+ '		<td colspan="2" id="type_3" style="display:'+((timerObj.type=='3')?'':'none')+';">'
	+ '			<table cellpadding="2" cellspacing="0">'
	+ '				<tr>'
	+ '					<td>'+"What day of the month (e.g. 2,7)?"+' </td>'
	+ '					<td><input type="text" id="dayOfMonths_'+deviceID+'_'+timerID+'" value="'+dayOfMonths+'" onChange="WUL_update_timer_values('+deviceID+','+timerID+')"></td>'
	+ '				</tr>'
	+ '				<tr>'
	+ '					<td colspan="2">'+WUL_timed_event_subtype('m',dayOfMonthTime,deviceID,timerID)+' '+WUL_event_time_picker('m',dayOfMonthTime,deviceID,timerID)+'</td>'
	+ '				</tr>'
	+ '			</table>'
	+ '		</td>'
	+ '	</tr>';
	
	var d = new Date();
	var sMonth=d.getMonth()+1;
	var sDay=d.getDate();
	var sYear=d.getFullYear();
	var sHour=d.getHours();
	var sMinute=d.getMinutes();
	var sSecond=d.getSeconds();
	
	if(timerObj.type==4 && timerObj.abstime){
		var full_date=timerObj.abstime.split(' ');
		if(full_date.length>=2){
			absoluteDate=full_date[0];
			var parts=absoluteDate.split('-');
			var sYear=parts[0];
			var sMonth=parts[1];
			var sDay=parts[2];

			absoluteTime=full_date[1];
			var tparts=absoluteTime.split(':');
			var sHour=tparts[0];
			var sMinute=tparts[1];
			var sSecond=tparts[2];
		}
	}	
	html+='<tr>'
	+ '		<td><label><input type="radio" name="timedEventType_'+deviceID+'_'+timerID+'" id="timedEventType_'+deviceID+'_'+timerID+'_4" value="4" '+((timerObj.type=='4')?'checked':'')+' onClick="WUL_set_timer_option('+deviceID+','+timerID+',4);"> <span></label><B>'+"Absolute"+':</B></span></td>'
	+ '		<td>'+"Example: Do something on 5 Mar 2005 at 11:15"+'</td>'
	+ ' </tr>'
	+ ' <tr>'
	+ '		<td colspan="2" id="type_4" style="display:'+((timerObj.type=='4')?'':'none')+';">'
	+ '			<table>'
	+ ' 				<tr>'
	+ '						<td>'+"What date?"+'</td>'
	+ '						<td>' + WUL_absolute_date_picker(sMonth,sDay,sYear,deviceID,timerID) +'</td>'
	+ '					</tr>'
	+ ' 				<tr>'
	+ '						<td>'+"What time?"+' (e.g. 10:00,21:30:35) </td>'
	+ '						<td>' + WUL_absolute_time_picker(sHour,sMinute,sSecond,deviceID,timerID) + '</td>'
	+ '					</tr>'
	+ '			</table>'
	+ '		</td>'
	+ '	</tr>'
	+ '</table>'
	+ '<table border="0" align="center">'
	+ '	<tr>'
	+ '		<td align="center"><input type="button" class="btn" onClick="WUL_timers('+deviceID+');" value="'+"Done"+'"> <input type="button" class="btn" onClick="WUL_remove_timer('+deviceID+','+timerID+');" value="'+"Remove timer"+'"></td>'
	+ ' </tr>'
	+ '</table>';
	

	set_panel_html(html);

}

function WUL_update_timer_values(deviceID,timerID){
    var timersObj = get_timer_obj(deviceID);
    var nodeObj = get_node_obj(timersObj,timerID);
    
    eval("var Name=$('Name_Timer_"+deviceID+"_"+timerID+"').value");
    eval("var Duration=$('Duration_Timer_"+deviceID+"_"+timerID+"').value");
    
    nodeObj.name = Name;
    
    Duration=parseInt(Duration);
    if(Duration!=0 && isNaN(Duration)!==true){
        nodeObj.duration = Duration;
    }
    
	switch(parseInt(nodeObj.type)){
		case 1:
			eval("var interval=$('intervalNumber_"+deviceID+"_"+timerID+"').value");
			eval("var intervalType=$('intervalType_"+deviceID+"_"+timerID+"').value");
			interval=parseInt(interval);
		
			if(interval!=0 && isNaN(interval)!==true){
				intervalType=(intervalType==1)?'h':'m';
				nodeObj.interval=interval+intervalType;				
			}
            
            set_timer_byId(timersObj,nodeObj,timerID,deviceID);
            
		break;
		case 2:
			var days=new Array();
			for(var i=1;i<=7;i++){
				eval("var isChecked=$('dayOfWeek_"+i+"_"+deviceID+"_"+timerID+"').checked");
				if(isChecked){
					days[days.length]=i;
				}
			}
			
			eval("var sType=$('w_stype_"+deviceID+"_"+timerID+"').value");			
			if(sType=='R'){
				var dayOfWeekTime='0:0:0R';
			}else if(sType=='T'){
				var dayOfWeekTime='0:0:0T';
			}else{
				if($('w_hour_'+deviceID+'_'+timerID)){
					eval("var sHour=$('w_hour_"+deviceID+"_"+timerID+"').value");
					eval("var sMinute=$('w_minute_"+deviceID+"_"+timerID+"').value");
					eval("var sSecond=$('w_second_"+deviceID+"_"+timerID+"').value");
				}else{
					var sHour=0;
					var sMinute=0;
					var sSecond=0;
				}				
				var dayOfWeekTime=sType.charAt(1)+sHour+':'+sMinute+':'+sSecond+sType.charAt(0);			
			}
						
			nodeObj.days_of_week=days.join(',');
			nodeObj.time=dayOfWeekTime;
        
            set_timer_byId(timersObj,nodeObj,timerID,deviceID);
            WUL_edit_timer(deviceID,timerID);
		break;
		case 3:
			eval("var sType=$('m_stype_"+deviceID+"_"+timerID+"').value");

			if(sType=='R'){
				var dayOfMonthTime='0:0:0R';
			}else if(sType=='T'){
				var dayOfMonthTime='0:0:0T';
			}else{
				if($('m_hour_'+deviceID+'_'+timerID)){
					eval("var sHour=$('m_hour_"+deviceID+"_"+timerID+"').value");
					eval("var sMinute=$('m_minute_"+deviceID+"_"+timerID+"').value");
					eval("var sSecond=$('m_second_"+deviceID+"_"+timerID+"').value");
				}else{
					var sHour=0;
					var sMinute=0;
					var sSecond=0;					
				}
				var dayOfMonthTime=sType.charAt(1)+sHour+':'+sMinute+':'+sSecond+sType.charAt(0);
			}			
			eval("var dayOfMonths=$('dayOfMonths_"+deviceID+"_"+timerID+"').value");			
			
			nodeObj.days_of_month=dayOfMonths;
			nodeObj.time=dayOfMonthTime;
            
            set_timer_byId(timersObj,nodeObj,timerID,deviceID);
			WUL_edit_timer(deviceID,timerID);
		break;
		case 4:
			eval("var sMonth=$('p_month_"+deviceID+"_"+timerID+"').value");
			eval("var sDay=$('p_day_"+deviceID+"_"+timerID+"').value");
			eval("var sYear=$('p_year_"+deviceID+"_"+timerID+"').value");

			eval("var sHour=$('p_hour_"+deviceID+"_"+timerID+"').value");
			eval("var sMinute=$('p_minute_"+deviceID+"_"+timerID+"').value");
			eval("var sSecond=$('p_second_"+deviceID+"_"+timerID+"').value");
		
			var absoluteDate=sYear+'-'+sMonth+'-'+sDay;
			absoluteTime=sHour+':'+sMinute+':'+sSecond;	
				
			nodeObj.abstime=absoluteDate+' '+absoluteTime;
            
            set_timer_byId(timersObj,nodeObj,timerID,deviceID);
		break;
	}
	//debug_json(nodeObj);
    
    has_changes('updated timer values');
}

function WUL_set_timer_option(deviceID,timerID,val){
    var timersObj = get_timer_obj(deviceID);
    var nodeObj = get_node_obj(timersObj,timerID);
	
	var newType=$('timedEventType_'+deviceID+'_'+timerID+'_'+val).value;
	
	// if type has changed, remove existing tags
	if(nodeObj.type!=newType){
		delete nodeObj.interval;
		delete nodeObj.days_of_week;
		delete nodeObj.time;
		delete nodeObj.days_of_month;
		delete nodeObj.abstime;
		nodeObj.type=newType;
	}
	
	switch(parseInt(nodeObj.type)){
		case 1:
			nodeObj.interval="";
		break;
		case 2:
			nodeObj.days_of_week="";
			nodeObj.time="";
		break;
		case 3:
			nodeObj.days_of_month="";
			nodeObj.time="";
		break;
		case 4:
			nodeObj.abstime="";
		break;
	}
    //log_message(Object.toJSON(nodeObj));
    set_timer_byId(timersObj,nodeObj,timerID,deviceID);
	WUL_edit_timer(deviceID,timerID);	
	has_changes('updated timer');
}

function WUL_timed_event_subtype(prefix,dayOfMonthTime,deviceID,timerID){
	var last_char=dayOfMonthTime.substr(dayOfMonthTime.length-1,1);
	var selected=(last_char=='R' || last_char=='T')?last_char:'';
	if(selected!=''){
		dayOfMonthTime=dayOfMonthTime.substr(0,dayOfMonthTime.length-1);
	}
	var time_prefix=dayOfMonthTime.charAt(0);
	
		
	var html='<select id="'+prefix+'_stype_'+deviceID+'_'+timerID+'" onChange="WUL_update_timer_values('+deviceID+','+timerID+');" class="styled" style="width:200px;">';
	html+='<option value="" '+((selected=='')?'selected':'')+'>'+"At a certain time of day"+'</option>';
	html+='<option value="R" '+((selected=='R' && time_prefix!='-' && time_prefix!='+')?'selected':'')+'>'+"At sunrise"+'</option>';
	html+='<option value="R-" '+((selected=='R' && time_prefix=='-')?'selected':'')+'>'+"Before sunrise"+'</option>';
	html+='<option value="R+" '+((selected=='R' && time_prefix=='+')?'selected':'')+'>'+"After sunrise"+'</option>';
	html+='<option value="T" '+((selected=='T' && time_prefix!='' && time_prefix!='+')?'selected':'')+'>'+"At sunset"+'</option>';
	html+='<option value="T-" '+((selected=='T' && time_prefix=='-')?'selected':'')+'>'+"Before sunset"+'</option>';
	html+='<option value="T+" '+((selected=='T' && time_prefix=='+')?'selected':'')+'>'+"After sunset"+'</option>';
	html+='</select>';	
	
	return html;
}

function WUL_event_time_picker(prefix,dayOfMonthTime,deviceID,timerID){
	if(dayOfMonthTime=='0:0:0R' || dayOfMonthTime=='0:0:0T'){
		return '';
	}
	var last_char=dayOfMonthTime.substr(dayOfMonthTime.length-1,1);
	var selected=(last_char=='R' || last_char=='T')?last_char:'';

	if(selected!=''){
		dayOfMonthTime=dayOfMonthTime.substr(0,dayOfMonthTime.length-1);
	}
	var parts=dayOfMonthTime.split(":");	
	if(parts.length==3){
		var sHour=parts[0];
		sHour=(sHour<0)?((-1)*sHour):sHour;
		var sMinute=parts[1];
		var sSecond=parts[2];
	}else{
		var sHour=0;
		var sMinute=0;
		var sSecond=0;
	}	
		
	var html='h:m:s <select id="'+prefix+'_hour_'+deviceID+'_'+timerID+'" onChange="WUL_update_timer_values('+deviceID+','+timerID+');" class="styled" style="width:70px;">';
	if(selected!=''){
		for(var i=0;i<7;i++){
			html+='<option value="'+i+'" '+((sHour==i)?'selected':'')+'>'+i.toPaddedString(2)+'</option>';
		}		
	}else{
		for(var i=0;i<24;i++){
			html+='<option value="'+i+'" '+((sHour==i)?'selected':'')+'>'+i.toPaddedString(2)+'</option>';
		}
	}
	html+='</select>:';

	html+='<select id="'+prefix+'_minute_'+deviceID+'_'+timerID+'" onChange="WUL_update_timer_values('+deviceID+','+timerID+');" class="styled" style="width:70px;">';
	for(var i=0;i<60;i++){
		html+='<option value="'+i+'" '+((sMinute==i)?'selected':'')+'>'+i.toPaddedString(2)+'</option>';
	}
	html+='</select>:';

	html+='<select id="'+prefix+'_second_'+deviceID+'_'+timerID+'" onChange="WUL_update_timer_values('+deviceID+','+timerID+');" class="styled" style="width:70px;">';
	for(var i=0;i<60;i++){
		html+='<option value="'+i+'" '+((sSecond==i)?'selected':'')+'>'+i.toPaddedString(2)+'</option>';
	}
	html+='</select>';
	
	return html;	
}

function WUL_timers(deviceID){
	try{
		var timersObj = get_timer_obj(deviceID);

		// list schedules
	    var html = '<table width="100%" class="m_table skinned-form-controls skinned-form-controls-mac">';
		var timersNo = (timersObj)?timersObj.length:0;
		if(timersNo>0){
			for(var i=0;i<timersNo;i++){
				var timerName=timersObj[i].name;
				var timerEnabled=timersObj[i].enabled;
                            
                switch(parseInt(timersObj[i].type)){
                    case 1:
                        timerType= 'Interval';
                        timerTime = "Every" + ' '+timersObj[i].interval;
                    break;
                    case 2:
                        timerType= 'Day of week';
                        timerTime = timersObj[i].time;
                        /*var days = timersObj[i].days_of_week.split(',');
                        var description = '';
                        var daysNo = days.length;
                        for(var i=0;i<daysNo;i++){
                            description += get_day_names(days[i]);
                            if(i!=(daysNo-1)){
                                description += ', ';
                            }
                        }
                        timerTime += ' ('+description+')';*/
                         timerTime += ' ('+timersObj[i].days_of_week+')';
                    break;
                    case 3:
                        timerType= 'Day of month';
                        timerTime = timersObj[i].time;
                        //timerTime += ' (On following days of month : '+timersObj[i].days_of_month+')';
                        timerTime += ' ('+timersObj[i].days_of_month+')';
                    break;
                    case 4:
                        timerType= 'Absolute';
                        timerTime = "Run at"+' '+timersObj[i].abstime;
                    break;
                }
                var timerTime =
                
				html += '<tr valign="middle">'
				+ '        <td align="left">'+timerName+'</td>'
				+ '        <td align="left">'+timerType+'</td>'
				+ '        <td align="center">'+timerTime+'</td>'
				+ '        <td class="contentcenter">'+"Enabled"+': <label><input type="checkbox" id="timer_enabled_'+deviceID+'_'+timersObj[i].id+'" value="1" '+((timerEnabled==undefined || timerEnabled==1)?'checked':'')+' onClick="WUL_switch_timer('+deviceID+','+timersObj[i].id+')"><span></span></label></td>'
				+ '        <td><input type="button" class="btn" value="'+"Edit"+'" onClick="WUL_edit_timer('+deviceID+','+timersObj[i].id+');">'
				+ '			<input type="button" class="btn" value="'+"Delete"+'" onClick="WUL_remove_timer('+deviceID+','+timersObj[i].id+');">'
				+ '		   </td>'
				+ '	</tr>';
				
			}
		}else{
			html+='<tr><td class="regular">'+"No timers"+'</td></tr>';
		}
		html+='</table>';
		html+='<div align="right" class="m_table">'
		+ '<div class="m_separator_inner"></div>'
		+ '<input type="button" class="btn" value="'+"Add timer"+'" onClick="WUL_edit_timer('+deviceID+');"></div>';
	
		set_panel_html(html);
        
	}catch(e){
		log_message('scene_timers error: '+e);
	}
}

function WUL_remove_timer(deviceID,timerID){
	var timersObj = get_timer_obj(deviceID);
	
	if(!confirm("Are you sure you want to remove this schedule?")){
		return;
	}
	var listIndex = get_node_index(timersObj,timerID);
	
	// delete from index array
	timersObj.splice(listIndex,1);
	
    set_timer_obj(deviceID,timersObj);
	WUL_timers(deviceID);
	set_infobox("Timer deleted.",'success');
	has_changes('timer deleted');
}


function WUL_switch_timer(deviceID,timerID){
    var timersObj = get_timer_obj(deviceID);
	var timerObj = get_node_obj(timersObj,timerID);
	
	var timerEnabled=$('timer_enabled_'+deviceID+'_'+timerID).checked;
	
	timerObj.enabled=(timerEnabled===true)?1:0;
    set_timer_byId(timersObj,timerObj,timerID,deviceID);
	has_changes('switch timer');
    
    
}

function WUL_absolute_date_picker(sMonth,sDay,sYear,deviceID,timerID){
	var monthNames = ['- month -',
	"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December"
		];
	
	var html='<select id="p_month_'+deviceID+'_'+timerID+'" onChange="WUL_update_timer_values('+deviceID+','+timerID+');" class="styled" style="width:150px;">';
	for(var i=0;i<monthNames.length;i++){
		html+='<option value="'+i+'" '+((sMonth==i)?'selected':'')+'>'+monthNames[i]+'</option>';
	}
	html+='</select>';

	html+='<select id="p_day_'+deviceID+'_'+timerID+'" onChange="WUL_update_timer_values('+deviceID+','+timerID+');" class="styled" style="width:70px;">';
	for(var i=0;i<=31;i++){
		html+='<option value="'+i+'" '+((sDay==i)?'selected':'')+'>'+((i!=0)?i:'- day -')+'</option>';
	}
	html+='</select>';	
	
	html+='<select id="p_year_'+deviceID+'_'+timerID+'" onChange="WUL_update_timer_values('+deviceID+','+timerID+');" class="styled" style="width:80px;">';
	html+='<option value="0" '+((sYear==0)?'selected':'')+'>- year -</option>';
	for(var i=2010;i<=2020;i++){
		html+='<option value="'+i+'" '+((sYear==i)?'selected':'')+'>'+i+'</option>';
	}
	html+='</select>';	
	return html;
}


function WUL_absolute_time_picker(sHour,sMinute,sSecond,deviceID,timerID){
	
	var html='<select id="p_hour_'+deviceID+'_'+timerID+'" onChange="WUL_update_timer_values('+deviceID+','+timerID+');" class="styled" style="width:70px;">';
	for(var i=0;i<24;i++){
		html+='<option value="'+i+'" '+((sHour==i)?'selected':'')+'>'+i.toPaddedString(2)+'</option>';
	}
	html+='</select>';

	html+='<select id="p_minute_'+deviceID+'_'+timerID+'" onChange="WUL_update_timer_values('+deviceID+','+timerID+');" class="styled" style="width:70px;">';
	for(var i=0;i<60;i++){
		html+='<option value="'+i+'" '+((sMinute==i)?'selected':'')+'>'+i.toPaddedString(2)+'</option>';
	}
	html+='</select>';

	html+='<select id="p_second_'+deviceID+'_'+timerID+'" onChange="WUL_update_timer_values('+deviceID+','+timerID+');" class="styled" style="width:70px;">';
	for(var i=0;i<60;i++){
		html+='<option value="'+i+'" '+((sSecond==i)?'selected':'')+'>'+i.toPaddedString(2)+'</option>';
	}
	html+='</select>';
	
	return html;
}
