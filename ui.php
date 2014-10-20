<?php
class Nxj_UI {

	public function __construct() {
	}

	const TIME_DECADE	= 315360000;
	const TIME_YEAR		= 31536000;
	const TIME_MONTH	= 2628000;
	const TIME_WEEK		= 604800;
	const TIME_DAY		= 86400;
	const TIME_HOUR		= 3600;
	const TIME_MINUTE	= 60;
	const TIME_SECOND	= 1;
	public static function anythingToTime($input=null){
		if(!$input){
			return time();
		}else if(is_array($input)){
			$output = array();
			foreach($input as $item){
				$output[] = self::anythingToTime($item);
			}
			return $output;
		}else if(preg_match('/^[0-9]*$/', "$input")){
			return $input;
		}else if(is_string($input)){
			return strtotime($input);
		}
	}
	public static function timeAgo($input, $unit=null){
		$unitNames = array(
			self::TIME_DECADE	=> 'decade'
			,self::TIME_YEAR	=> 'year'
			,self::TIME_MONTH	=> 'month'
			,self::TIME_WEEK	=> 'week'
			,self::TIME_DAY		=> 'day'
			,self::TIME_HOUR	=> 'hour'
			,self::TIME_MINUTE	=> 'minute'
			,self::TIME_SECOND	=> 'second'
		);
		$diff = time() - $input;
		if(isset($unit)){
			$name = $unitNames[$unit];
		}else{
			foreach($unitNames as $u => $n){
				if($diff > $u){
					$unit = $u;
					$name = $n;
					break;
				}
			}
		}
		$diff = floor($diff/$unit);
		if($name=='second' && $diff<5) return "just now";
		return "$diff $name".($diff==1 ? '' : 's')." ago";
	}

	/**
	* @param array $params {
	*
	*   Required arguments:
	*
	*   @type String 'id' => 'lightbox'
	*	   The id attribute applied to the outer-most <div> of the widget.
	*
	*   @type String 'title' => 'Text to be displayed'
	*	   The string to display in the title section of the lightbox.
	*
	*   @type String 'content' => 'Text to be displayed'
	*	   A string containing the main body of the lightbox. This can be generated by another $params['part']() call, if desired.
	*
	*
	*   Optional arguments:
	*
	*   @type Boolean 'showCloseButton' => true
	*	   <Defualt> true
	*	   If true, puts an 'X' in the upper-right corner of the lightbox that closes the whole lightbox. If false, the 'X' is omitted, and you will need to hide() the lightbox yourself.
	*
	*   @type Boolean 'clickClose' => false
	*	   <Defualt> false
	*	   If true, clicking outside the lightbox (in the grey area) will close the lightbox.
	*
	*   @type Boolean 'visible' => false
	*	   <Defualt> false
	*	   If true, the lightbox will be visible on pageload. If false, it will be hidden, and should be activated by Javascript.
	*
	*   @type Integer 'width' => auto
	*	   <Defualt> auto
	*	   The width of the lightbox. Defaults to the width of the content, however there is a min-width of 400px.
	*
	*   @type Integer 'height' => auto
	*	   <Defualt> auto
	*	   The height of the lightbox. Defaults to the height of the content plus the height of the title.
	*
	*   @type Integer 'top' => 200
	*	   <Defualt> 200
	*	   The top margin of the lightbox in pixels. If the lightbox is tall, it may be helpful to reduce this margin so the whole lightbox fits on screen.
	*
	* }
	* @return String
	*/
	public static function lightbox($params) {
		$clickClose = (isset($params['clickClose'])&&$params['clickClose'] ? true : false);
		$display = (isset($params['visible'])&&$params['visible']?'':'display:none;');
		$callback = (isset($params['callback'])&&$params['callback'] ? $params['callback'].'();' : '');
		$style = ''
			.(isset($params['top'])?'margin-top:'.$params['top'].'px;':'')
			.(isset($params['width'])?'width:'.$params['width'].'px;':'')
			.(isset($params['height'])?'height:'.$params['height'].'px;':'');

		$output = "
<div class=\"nxj_lightboxHolder\"
		style=\"".$display."\"
		id=\"".$params['id']."\"
		".($clickClose ? " onclick=\"if(!Event.findElement(event,'.nxj_lightbox')){ $('".$params['id']."').hide(); $callback }\"" : "")."
	>
	<div class=\"nxj_lightbox\" style=\"".$style."\">";

		if(!isset($params['showCloseButton']) || $params['showCloseButton']==true){
			$output .= "
		<div class=\"nxj_lightboxClose\" onclick=\"$('".$params['id']."').hide(); ".$callback."\"></div>";
		}

		$output .= "
		<div class=\"nxj_lightboxTitle\">".$params['title']."</div>
		<div class=\"nxj_lightboxContent\">".$params['content']."</div>
	</div>
</div>";

		return $output;
	}

	public static function tabs($params) {
		$params['fixed'] = isset($params['fixed']) ? $params['fixed'] : false;
		$callback = isset($params['callback'])&&$params['callback'] ? 'onclick="'.$params['callback'].'();"' : '';

		$output = "
<div id=\"".$params['id']."\" class=\"nxj_tabs\" $callback>
	<div class=\"tabHolder\">";
		foreach($params['tabs'] as $tab){
			$output .= "
		<div class=\"tab".(!empty($tab->selected) ? ' selected' : '').(($params['fixed']) ? ' large' : '')."\" data-target=\"".$params['id'].'_'.$tab->label."\">
			".$tab->label."
		</div>";
		}
		$output .= "
		<div class=\"clear\"></div>";

		foreach($params['tabs'] as $tab){
			$output .= "
		<div class=\"".$params['id'].'_'.$tab->label." nxj_tabBlock".(empty($tab->selected) ? ' hide' : '')."\">
			".$tab->content."
		</div>";
		}

		$output .= "
	</div>
</div>";
		return $output;
	}

	public static function button($params) {
		$background = isset($params['imageURL']) ? "background-image:url('".$params['imageURL']."');" : "";
		$color = isset($params['color']) ? strtolower($params['color']) : 'blue';
		$width = "width:".(isset($params['imageURL']) ? $params['width'] : $params['width']-28)."px;";

		$output = "
<a id=\"".$params['id']."\"
		class=\"nxj_button".(isset($params['disabled'])&&$params['disabled'] ? ' disabled' : '').(isset($params['float']) ? ' float'.ucfirst($params['float']) : '').(isset($params['imageURL']) ? '' : ' nxj_cssButton')." $color\"
		style=\"$background $width\"
		href=\"".(isset($params['linkURL']) ? $params['linkURL'] : 'javascript:void(0);')."\"
		onclick=\"";

		if(isset($params['callback'])){
			$output .= "if(!$(this).hasClassName('disabled')) return ".$params['callback']."() !== false;\"";
		}else{
			$output .= "return !$(this).hasClassName('disabled');\"";
		}

		$output .= "
	>
		".(!isset($params['imageURL'])&&isset($params['text']) ? $params['text'] : '')."
</a>";

		return $output;
	}

	public static function selectbox($params) {
		$output = "
<div id=\"".$params['id']."\"
		class=\"nxj_select".(isset($params['float']) ? ' float'.ucfirst($params['float']) : '').(isset($params['class']) ? ' '.$params['class'] : '')."\"
		style=\"width:".($params['width']-2)."px;".(isset($params['zindex']) ? ' z-index:'.$params['zindex'].';' : '')."\">
	<div class=\"nxj_selectDisplay default\"".(isset($params['defaultText']) ? ' placeholder="'.$params['defaultText'].'"' : '').">".(isset($params['defaultText']) ? $params['defaultText'] : '')."</div>
	<div class=\"nxj_selectArrow\"></div>
	<div class=\"nxj_selectInner\">";

		foreach($params['options'] as $oneOption){
			$output .= "
		<div class=\"nxj_selectOption\"
					data-value=\"".$oneOption->value."\"
					".(isset($params['callback']) ? "onclick=\"".$params['callback']."($(this).getAttribute('data-value'), $(this).innerHTML);\"" : "")."
					".(isset($oneOption->default)&&$oneOption->default ? ' data-default="true"' : '')."
			>
			".$oneOption->display."
		</div>";
		}

		$output .= "
	</div>
	<input class=\"nxj_selectValue\"
		id=\"".$params['id']."_input\"
		type=\"hidden\"
		".(isset($params['name']) ? 'name="'.$params['name'].'"' : $params['id'])."
		value=\"".(isset($params['defaultValue']) ? $params['defaultValue'] : '')."\"/>
</div>";

		return $output;
	}

	public static function datepicker($params) {
		$type = isset($params['type']) ? $params['type'] : 'single';
		$date_start = Nxj_UI::anythingToTime($type=='range' ? $params['date_start'] : (isset($params['date']) ? $params['date'] : null));
		$date_end = isset($params['date_end']) ? Nxj_UI::anythingToTime($params['date_end']) : null;
		$firstShown = strtotime(date('Y-m-d', Nxj_UI::anythingToTime(isset($params['firstShown'])?$params['firstShown']:$date_start)));
		$name = isset($params['name']) ? $params['name'] : null;
		$id = isset($params['id']) ? $params['id'] : null;
		$monthCount = isset($params['monthCount']) ? $params['monthCount'] : 1;
		$width = isset($params['width']) ? $params['width'] : ($type=='range' ? 230 : 110);
		$inputWidth = $type=='range' ? ($width-30)/2 : $width-10;
		$allowPast = isset($params['allowPast']) ? $params['allowPast'] : false;
		$pinSide = isset($params['openDir'])&&stripos($params['openDir'],'left')!==false ? 'right:0;' : 'left:0;';
		$pinEdge = isset($params['openDir'])&&stripos($params['openDir'],'up')!==false ? 'bottom:100%;' : 'top:100%;';
		$zindex = isset($params['zindex'])?$params['zindex']:null;

		$output = "
<div class=\"nxj_datePicker".(isset($params['float']) ? ' float'.ucfirst($params['float']) : '')."\"
		".($id?'id="'.$id.'"':'')."
		style=\"".($width?'width:'.$width.'px;':'').($zindex!==null?'z-index:'.$zindex.';':'')."\"
		data-type=\"$type\"
		data-monthcount=\"$monthCount\"
		data-firstshown=\"$firstShown\"
		data-allowpast=\"".($allowPast?1:0)."\"
		data-period=\"start\"
		data-start=\"$date_start\"
		".($type=='range' ? 'data-end="'.$date_end.'"' : '')."
		".(isset($params['callback']) ? 'data-callback="'.$params['callback'].'"' : '')."
	>
	<input class=\"nxj_input\"
			type=\"text\"
			value=\"".date('n/j/Y', $date_start)."\"
			style=\"width:".$inputWidth."px;\"
			".($id?'id="'.$id.($type=='range'?'_start':'').'_display"':'')."
			data-period=\"start\"
		/>
	<input class=\"nxj_datePickerReal\"
			type=\"hidden\"
			value=\"$date_start\"
			".($name?'name="'.$name.($type=='range'?'_start':'').'"':'')."
			".($id?'id="'.$id.($type=='range'?'_start':'').'_real"':'')."
		/>";

		if($type=='range'){
			$output .= "
	<div class=\"calendar_icon\" style=\"right:".($inputWidth+24)."px;\" data-period=\"start\"></div>
	<input class=\"nxj_input\"
			type=\"text\"
			value=\"".date('n/j/Y', $date_start)."\"
			style=\"width:".($inputWidth)."px;margin-left:10px;\"
			".($id?'id="'.$id.($type=='range'?'_end':'').'_display"':'')."
			data-period=\"end\"
		/>
	<input class=\"nxj_datePickerReal\"
			type=\"hidden\"
			value=\"$date_start\"
			".($name?'name="'.$name.($type=='range'?'_end':'').'_start"':'')."
			".($id?'id="'.$id.($type=='range'?'_end':'').'_real"':'')."
		/>";
		}

		$output .= "
	<div class=\"calendar_icon\" data-period=\"".($type=='range' ? 'end' : 'start')."\"></div>
	<div class=\"nxj_calendar monthCount_$monthCount\" style=\"$pinSide$pinEdge\">";

		if($params['title']){
			$output .= "
		<div class=\"nxj_calendarHeader\">
			".$params['title']."
		</div>";
		}

		for($i=0; $i<$monthCount; ++$i){
			$output .= "
		<div class=\"nxj_month ".($i%3==2||$i==$monthCount-1?'last':'')."\">
			<div class=\"nxj_monthHeader\">";

			if($i==0){
				$output .= "
				<div class=\"monthScroll left\" title=\"Previous month\">&lt;</div>";
			}

			$output .= "
				<div class=\"monthName\"></div>";

			if($i==$monthCount-1){
				$output .= "
				<div class=\"monthScroll right\" title=\"Next month\">&gt;</div>";
			}

			$output .= "
			</div>
			<div class=\"clear\"></div>

			<div class=\"nxj_dayNames\">
				<div class=\"dayName\">Su</div>
				<div class=\"dayName\">Mo</div>
				<div class=\"dayName\">Tu</div>
				<div class=\"dayName\">We</div>
				<div class=\"dayName\">Th</div>
				<div class=\"dayName\">Fr</div>
				<div class=\"dayName\">Sa</div>
			</div>
			<div class=\"clear\"></div>

			<div class=\"nxj_monthBody\"></div>
		</div>";

			if($i%3==2&&$i<$monthCount-1){
				$output .= "
		<div class=\"clear\" style=\"height:10px;\"></div>";
			}
		}

		$output .= "
	</div>
</div>";

		return $output;
	}

	public static function slider($params) {
		$id = isset($params['id']) ? $params['id'] : null;
		$name = isset($params['name']) ? $params['name'] : null;
		$type = isset($params['type']) ? $params['type'] : 'single';
		$mode = isset($params['mode']) ? $params['mode'] : 'discrete';
		$decimals = isset($params['decimals']) ? (int)$params['decimals'] : 0;
		$min = isset($params['min']) ? (float)$params['min'] : 0;
		$max = isset($params['max']) ? (float)$params['max'] : 100;
		$increment = isset($params['increment']) ? $params['increment'] : ($mode=='discrete'?($max-$min)/5:pow(0.1,$decimals));
		$temp1 = isset($params['value1']) ? (float)$params['value1'] : ($type=='range' ? (4*$min+$max)/5.0 : $min);
		$temp2 = isset($params['value2']) ? (float)$params['value2'] : (isset($params['value']) ? (float)$params['value'] : ($type=='range' ? (4*$max+$min)/5.0 : (3*$max+2*$min)/5.0));
		$value1 = min($temp1, $temp2);
		$value2 = max($temp1, $temp2);
		$width = isset($params['width']) ? (int)$params['width']-20 : 180;
		$scale = ($max-$min) ? ($width/($max-$min)) : $width;
		$segWidth = floor(($value2-$value1) * $scale);
		if(isset($params['increment'])){
			$min = ceil($min/$increment)*$increment;
			$max = floor($max/$increment)*$increment;
			$value1 = round($value1/$increment)*$increment;
			$value2 = round($value2/$increment)*$increment;
		}
		if(!$decimals){
			$min = (int)$min;
			$max = (int)$max;
			$value1 = (int)$value1;
			$value2 = (int)$value2;
			$increment = (int)$increment;
		}
		$value1 = min($max, max($min, $value1));
		$value2 = min($max, max($min, $value2));
		$disabled = ($max==$min);
		$marker = isset($params['marker']) ? $params['marker'] : false;
		$float = isset($params['float']) ? 'float'.ucfirst($params['float']) : '';
		$callback = isset($params['callback']) ? $params['callback'] : null;

		$output = "
<div class=\"nxj_slider $type ".($marker ? "marker_$marker" : '')." $float ".($disabled?'disabled':'')."\"
		".($id?'id="'.$id.'"':'')."
		style=\"width:".($width+20)."px;\"
		data-type=\"$type\"
		data-mode=\"$mode\"
		data-decimals=\"$decimals\"
		data-min=\"$min\"
		data-max=\"$max\"
		data-scale=\"$scale\"
		data-marker=\"$marker\"
		data-increment=\"$increment\"
		".($disabled?'data-disabled="1"':'')."
		".($callback ? 'data-callback="'.$callback.'"' : '')."
	>";

		if($type=='range'){
			$output .= "
	<input class=\"nxj_sliderInput_left\" ".($id?'id="'.$id.'_value_left"':'')." type=\"hidden\" ".($name?'name="'.$name.'_left"':'')." value=\"$value1\" />
	<input class=\"nxj_sliderInput_right\" ".($id?'id="'.$id.'_value_right"':'')." type=\"hidden\" ".($name?'name="'.$name.'_right"':'')." value=\"$value2\" />";
		}else{
			$output .= "
	<input class=\"nxj_sliderInput_right\" ".($id?'id="'.$id.'_value"':'')." type=\"hidden\" ".($name?'name="'.$name.'"':'')." value=\"$value2\" />";
		}

		$output .= "
	<div class=\"nxj_sliderBar\" style=\"width:".$width."px;\"></div>
	<div class=\"nxj_sliderSegment\" style=\"width:".($disabled?$width:$segWidth)."px; left:".(($value1-$min)*$scale)."px;\"></div>";

		if($type=='range'){
			$output .= "
	<div class=\"nxj_sliderHandle handleLeft\" style=\"left:".(($value1-$min)*$scale)."px;\"></div>";
		}

		$output .= "
	<div class=\"nxj_sliderHandle handleRight\" style=\"left:".($disabled?$width:($value2-$min)*$scale)."px;\"></div>
	<div class=\"clear\"></div>";

		if($marker){
			$index = 0;
			$markerJump = max($increment, 5/$scale);
			for($i=$min; $i<=$max; $i=min($i+$markerJump, $max)){
				if($mode=='discrete' || $i==$min || $i==$max){
					$output .= "
	<div class=\"nxj_sliderMarker\" data-index=\".($index++).\" style=\"left:".floor(($i-$min)*$scale)."px;\">
		".($marker=='number'?number_format($i,$decimals):'')."
	</div>";
				}
				if($i==$max) break;
			}
		}

		$output .= "
</div>";

		return $output;
	}

	public static function scrollbar($params) {
		$overflowX = ($params['overflowX'] ? strtolower($params['overflowX']) : 'auto');
		$overflowY = ($params['overflowY'] ? strtolower($params['overflowY']) : 'auto');
		$barThickness = (isset($params['barThickness']) ? (int)$params['barThickness'] : 15);
		$width = (isset($params['width']) ? (is_int($params['width']) ? $params['width'].'px' : $params['width']) : '100%');
		$height = (isset($params['height']) ? (is_int($params['height']) ? $params['height'].'px' : $params['height']) : 'auto');
		$callback = (isset($params['callback']) ? ' data-callback="'.$params['callback'].'"' : '');
		$output = "
<div class=\"nxj_scrollable\" style=\"width:$width;height:$height;\" data-overflowx=\"$overflowX\" data-overflowy=\"$overflowY\" data-barthickness=\"$barThickness\"$callback>
	<div class=\"nxj_scrollableContent\" style=\"overflow-x:$overflowX;overflow-y:$overflowY;\">
		<div class=\"nxj_scrollableInner\">".
			$params['content'].
		"</div>
	</div>
	<div class=\"nxj_scrollBarX\"></div>
	<div class=\"nxj_scrollBarY\"></div>
</div>";
		return $output;
	}

	public static function pagination($params) {
echo "Pagination is not fully implemented :(";
/*
<?php
$showAll = 0;
$callreset = 0;
if($params['showAll']){
	$showAll = $params['showAll'];
}
if($params['callreset']){
	$callreset = $params['callreset'];
}
?>

<div class="nxj_uiPagination">
	<ul class="nxj_uiPage">
		<li id="p_prev" <?phpif($params['current'] == 1){?>class="disabled"<?php}else{?>onclick="<?php=$params['callback']?>(-1);<?phpif($callreset==true){?>resetPaginate(-1,<?php=$params['total']?>,<?php=$showAll?>,'<?php=$params['callback']?>',<?php=$callreset?>);"<?php} }?>>
			&lt;&lt; Prev
		</li>
		<li id="p_1" <?phpif($params['current'] == 1){?>class="active"<?php}?> onclick="<?php=$params['callback']?>(1);<?phpif($callreset==true){?>resetPaginate(1,<?php=$params['total']?>,<?php=$showAll?>,'<?php=$params['callback']?>',<?php=$callreset?>);<?php}?>"> 1 </li>
		<li id="p_prel" class="hidden">...</li>
		<?phpfor($i=2;$i < $params['total'];$i++){?>
			<li id="p_<?php=$i?>" <?phpif($i == $params['current']){?>class="active"<?php}?> onclick="<?php=$params['callback']?>(<?php=$i?>);<?phpif($callreset==true){?>resetPaginate(<?php=$i?>,<?php=$params['total']?>,<?php=$showAll?>,'<?php=$params['callback']?>',<?php=$callreset?>);<?php}?>">
				<?php=$i?>
			</li>
		<?php}?>
		<li id="p_nxel" class="hidden">...</li>
		<li id="p_<?php=$params['total']?>" <?phpif($params['current'] == $params['total']){?>class="active"<?php}?> onclick="<?php=$params['callback']?>(<?php=$params['total']?>);<?phpif($callreset==true){?>resetPaginate(<?php=$params['total']?>,<?php=$params['total']?>,<?php=$showAll?>,'<?php=$params['callback']?>',<?php=$callreset?>);<?php}?>"> <?php=$params['total']?> </li>
		<li id="p_next" <?phpif($params['current'] == $params['total']){?>class="disabled"<?php}else{?>onclick="<?php=$params['callback']?>(-2);<?phpif($callreset){?>resetPaginate(-2,<?php=$params['total']?>,<?php=$showAll?>,'<?php=$params['callback']?>',<?php=$callreset?>);"<?php} }?>>
			Next &gt;&gt;
		</li>
		<?phpif($showAll){?>
			<li id="p_all" onclick="<?php=$params['callback']?>(0);<?phpif($callreset==true){?>resetPaginate(0,<?php=$params['total']?>,<?php=$showAll?>,'<?php=$params['callback']?>',<?php=$callreset?>);<?php}?>">View All</li>
		<?php}?>
	</ul>
</div>
*/
	}

	public static function tooltip($params) {
		$direction = (isset($params['direction']) ? ucfirst(strtolower($params['direction'])) : 'Up');
		$width = (isset($params['width']) ? $params['width'] : 0);
		$widthStyle = ($width ? 'width:'.$width.'px;' : '');
		$height = (isset($params['height']) ? $params['height'] : 0);
		$heightStyle = ($height ? 'height:'.$height.'px;' : '');
		$zindexStyle = (isset($params['zindex']) ? 'z-index:'.$params['zindex'].';' : '');
		$displayStyle = (isset($params['visible']) && $params['visible'] ? 'display:block;' : '');
		$oneLine = (isset($params['height']) ? '' : ' oneLine');
		$xoffsetStyle = '';
		$yoffsetStyle = '';
		if($direction=='Up' || $direction=='Down'){
			$xoffset = (isset($params['xoffset']) ? $params['xoffset'] : 0) - floor(($width?$width:140)/2 + 20);
			$xoffsetStyle = ($xoffset ? 'left:'.$xoffset.'px;' : '');
		}else{
			$yoffset = (isset($params['yoffset']) ? $params['yoffset'] : 0) - floor(($height?$height:13)/2  + 10);
			$yoffsetStyle = ($yoffset ? 'top:'.$yoffset.'px;' : '');
		}

		$output = "
<div ".(isset($params['id']) ? 'id="'.$params['id'].'"' : '')."
		class=\"nxj_tip$direction\"
		style=\"$zindexStyle$displayStyle\"
	>
	<div class=\"nxj_tipArrow\"></div>
	<div class=\"nxj_tipContent$oneLine\" style=\"$widthStyle$heightStyle$xoffsetStyle$yoffsetStyle\">
		".$params['content']."
	</div>
</div>";

		return $output;
	}

	public static function carousel($params) {
		$panels = array_values($params['panels']);
		$float = isset($params['float']) ? 'float'.ucfirst(strtolower($params['float'])) : '';

		$output = "
<div id=\"".$params['id']."\" class=\"nxj_carousel $float\"
		data-width=\"".$params['width']."\"
		data-height=\"".$params['height']."\"
		data-hoverpause=\"".(isset($params['hoverPause'])&&$params['hoverPause'] ? 'yes' : 'no')."\"
		data-delayduration=\"".(isset($params['delayDuration']) ? $params['delayDuration'] : '8.0')."\"
		data-animationtype=\"".(isset($params['animationType']) ? $params['animationType'] : 'slide')."\"
		data-animationdir=\"".(isset($params['animationDir']) ? $params['animationDir'] : 'E')."\"
		data-animationreversedir=\"".(isset($params['animationReverseDir']) ? $params['animationReverseDir'] : (isset($params['animationDir']) ? $params['animationDir'] : 'W'))."\"
		data-animationduration=\"".(isset($params['animationDuration']) ? $params['animationDuration'] : '0.9')."\"
		data-animationindex=\"1\"
		data-transition=\"".(isset($params['transition']) ? $params['transition'] : 'sinoidal')."\"
		data-currentindex=\"0\"
		data-numpanels=\"".count($panels)."\"
		data-autoscroll=\"".(isset($params['autoScroll'])&&!$params['autoScroll'] ? 'no' : 'yes')."\"
	>
	<div class=\"nxj_carouselInner\" style=\"width:".$params['width']."px;height:".$params['height']."px;\">";

		foreach($panels as $i=>$onePanel){
			$output .= "
		<div id=\"".($params['id'].'_panel_'.$i)."\" class=\"nxj_carouselPanel\" style=\"top:0;left:0;".($i==0 ? '' : 'display:none;')."\">
			$onePanel
		</div>";
		}

		$output .= "
	</div>";

		if(isset($params['showControls']) && $params['showControls']){
			$controlOffset = floor($params['width']/2.0 - 19 - 8*count($panels));
			$controlWidth = max(0, $params['width']-$controlOffset);
			$output .= "
	<div class=\"nxj_carouselControls\" style=\"width:".$controlWidth."px;padding-left:".$controlOffset."px;\">
		<div class=\"nxj_carouselControlsInner\">
			<div class=\"nxj_carouselControlsLeft\"></div>";

			for($i=0; $i<count($panels); ++$i){
				$output .= "
			<div class=\"nxj_carouselControlsDot".($i==0?' on':'')."\" data-index=\"$i\"></div>";
			}

			$output .= "
			<div class=\"nxj_carouselControlsRight\"></div>
		</div>
	</div>";
		}

		$output .= "
</div>";

		return $output;
	}
}
?>
