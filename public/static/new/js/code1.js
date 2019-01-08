var placeholders_supported = ('placeholder' in document.createElement('input')), hash_frame = false;
var check_sms_handler = 0;

function SMSStickerClose() {
  try {document.body.removeChild(__el('error_overlay'))} catch (err){}
	try {
	$('#sms_sticker').remove();
	} catch (err){}
	$.mask.close();
}

function OpenPassToggle(prefix) {
	var passopen=document.getElementById('show_pass'+prefix).checked;
	var opwf=document.getElementById('open_pwd'+prefix);
	var cpwf=document.getElementById('pwd'+prefix);

	if(passopen) {
		opwf.value=cpwf.value;
	} else {
		cpwf.value=opwf.value;
	}

	cpwf.style.display=passopen?'none':'inline';
	opwf.style.display=passopen?'inline':'none';
}

if (!Function.prototype.bind) {
	Function.prototype.bind = function (oThis) {
		if (typeof this !== 'function') {
			// closest thing possible to the ECMAScript 5
			// internal IsCallable function
			throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
		}

		var aArgs = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			fNOP = function () { },
			fBound = function () {
				return fToBind.apply(this instanceof fNOP
					? this
					: oThis,
					aArgs.concat(Array.prototype.slice.call(arguments)));
			};

		if (this.prototype) {
			// Function.prototype doesn't have a prototype property
			fNOP.prototype = this.prototype;
		}
		fBound.prototype = new fNOP();

		return fBound;
	};
}

function getCSSRule(ruleName) {
  ruleName=ruleName.toLowerCase();
  if (document.styleSheets) {
    for (var i=0; i<document.styleSheets.length; i++) {
      var styleSheet=document.styleSheets[i];
      var ii=0;
      var cssRule=false;
      do {
        if (styleSheet.cssRules) {
          cssRule = styleSheet.cssRules[ii];
        } else if (styleSheet.rules) {
          cssRule = styleSheet.rules[ii];
        }
        if (cssRule && cssRule.selectorText)  {
          if (cssRule.selectorText.toLowerCase()==ruleName) {
            return cssRule;
          }
        }
        ii++;
      } while (cssRule)
    }
  }
  return false;
}

function cloneCSSRule(selector,doc){
	if (!doc) doc = document;
	var sheet = doc.styleSheets[0];
	var cr = getCSSRule(selector);
	if (sheet && cr && cr.style){
		if (sheet.insertRule) {        // Firefox, Google Chrome, Safari, Opera
			if (cr.cssText) sheet.insertRule(cr.cssText, 0);
		} else {
			for (var r in cr.style){
				if (r == 'cssText') continue;
				if (cr.style[r] != '') {
					var rr = r.replace(/[A-Z]/g,function(s){return '-'+s.toLowerCase()});
					if (sheet.addRule) {        //Internet Explorer
						var rs = cr.style[r];
						if (/(error_sticker|error_overlay)$/.test(selector)){
							if (rr == 'position') rs = 'absolute';
							if (rr == 'top') rs = 'expression(ignoreMe = document.documentElement.scrollTop + "px")';
						}
						sheet.addRule (selector, rr+':'+rs, 0);
					}
				}
			}
		}
	}
}

function ClosePopOffersForm() {
	SMSStickerClose();
	var curr_date = new Date();
	CSRF.sendRequest({
		url: '/pages/ajax_empty2/',
		Method: 'post',
		params: { action:'set_subscr_reminder', utc_offset_min: -curr_date.getTimezoneOffset(), rand:Math.random() }
	});
	return false;
}


var CustomAlertBox = function() {
  this.visible=false;
  this.msgs=new Array();
  this.tmp_eval=Array();

  this.errorSticker=document.createElement('div');
  this.errorSticker.className="error_sticker";
  this.errorSticker.innerHTML='<div class="err_title">' + __l('Сообщение') + '</div>';

  this.errorStickerText=document.createElement('p');
  this.errorStickerText.className="err_text";
  this.errorSticker.appendChild(this.errorStickerText);

  this.errorStickerButtons = Array();

	for(var i=0;i<3;i++) {
    this.errorStickerButtons[i]=document.createElement('input');
    this.errorStickerButtons[i].type='button';
    this.errorStickerButtons[i].className='coolbutn';
	}

  this.errorStickerButtons[0].value='OK';
  this.errorStickerButtons[0].style.width='70px';
  this.errorStickerButtons[0].onclick=this.evalclose.bind(this);

  this.errorStickerButtons[1].value='';
  this.errorStickerButtons[1].style.marginLeft='10px';
  this.errorStickerButtons[1].style.display='none';
  this.errorStickerButtons[1].onclick=this.evalclose2.bind(this);

  this.errorStickerButtons[2].value = __l('Отмена');
  this.errorStickerButtons[2].style.width='70px';
  this.errorStickerButtons[2].style.marginLeft='10px';
  this.errorStickerButtons[2].onclick=this.close.bind(this);

  this.errorSticker.appendChild(this.errorStickerButtons[0]);
  this.errorSticker.appendChild(this.errorStickerButtons[1]);
  this.errorSticker.appendChild(this.errorStickerButtons[2]);

  this.errorOverlay=document.createElement('div');
  this.errorOverlay.className="error_overlay";
}

CustomAlertBox.prototype.close = function () {
	var doc;
	try { doc = window.parent && window.parent.document;
	} catch(e) { doc = document; } ;
  doc.body.removeChild(this.errorSticker);
  doc.body.removeChild(this.errorOverlay);
  this.visible=false;
  this.errorStickerButtons[1].style.display='none';
  if(this.msgs.length>0) { this.show(); }
}

CustomAlertBox.prototype.evalclose = function () {
  if(typeof(this.tmp_eval[0]) != 'undefined') this.tmp_eval[0]();
  this.close();
}

CustomAlertBox.prototype.evalclose2 = function () {
  if(typeof(this.tmp_eval[1]) != 'undefined') this.tmp_eval[1]();
  this.close();
}


var AddStylesToTop = [
		'.coolbutn',
		'input.coolbutn',
		'.error_overlay',
		'.error_sticker',
		'.err_text',
		'.err_title',
		'.error_sticker .err_text',
		'.error_sticker .coolbutn'
];

CustomAlertBox.prototype.show = function () {
  var str=this.msgs.shift();
	try { var doc = top.document;
	} catch(e) { var doc = document; } ;
  this.visible=true;
  if(str.constructor.toString().indexOf("Array") == -1) {
    this.errorStickerButtons[2].style.display='none';
    this.tmp_eval[0]=undefined;
  } else {
    this.errorStickerButtons[2].style.display='inline';
    this.tmp_eval[0]=str[1];
    if(typeof(str[2])!='undefined') {
      this.tmp_eval[1]=str[2];
    }
    str=str[0];
  }

  this.errorStickerText.innerHTML=str;
	if (doc !== document && !doc.cssAdded){
		for (var i=0; i<AddStylesToTop.length; i++){
			cloneCSSRule(AddStylesToTop[i],doc);
		}
		top.document.cssAdded = true;
	}
	if (doc.body != null) {
	  doc.body.appendChild(this.errorOverlay);
	  doc.body.appendChild(this.errorSticker);
	}

  this.errorSticker.style.top = (this.errorOverlay.clientHeight - this.errorSticker.clientHeight)/4 + 'px';
  this.errorSticker.style.left = (this.errorOverlay.clientWidth - this.errorSticker.clientWidth)/2 + 'px';

}

CustomAlertBox.prototype.alert = function (str,confirm,confirm2) {
  str=str.toString().replace(/\n/g,'<br />');
  if(typeof(confirm) != 'undefined') {
    if(typeof(confirm2) != 'undefined') {
      this.msgs.push(new Array(str,confirm,confirm2));
    } else
      this.msgs.push(new Array(str,confirm));
  }
  else
    this.msgs.push(str);
  if(!this.visible) { this.show(); }

}

function LoginRegisterCancel(msg){
	alertBox.errorStickerButtons[0].value = __l('Войти');
	alertBox.errorStickerButtons[1].value = __l('Зарегистрироваться');
	alertBox.errorStickerButtons[1].style.display='inline';
	alertBox.errorStickerButtons[1].style.width='150px';
	alertBox.alert(msg,function logexec() {
		window.location.href='/pages/login/';
	},function regexec() {
		window.location.href='/pages/registration/';
	});
}

var alertBox= new CustomAlertBox();

if (window.parent == window.top || !/(MSIE)\s+6\D+/i.test(navigator.userAgent)){
	window.alert = function(str) {
		if (window.top.alertBox) {
			window.top.alertBox.errorStickerButtons[0].value='OK';
			window.top.alertBox.alert(str);
		} else {
			alertBox.errorStickerButtons[0].value='OK';
			alertBox.alert(str);
		}
	};
}

function SpoilerSaveState(nodeId, state) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + 180);
	document.cookie = "spoiler_" + nodeId + "=" + escape(state) +
		";expires=" + exdate.toUTCString() + ";path=/";
}

function ExpandNode(nodeId, dspl) {

  dspl = dspl ? dspl : 'block';

  clickedElement=document.getElementById(nodeId).style;
	titNodeId = nodeId+'_title';

  if (!clickedElement)
    clickedElement=document.all.nodeId.style
  if (!clickedElement)
    return 1
  if (clickedElement.display == dspl){
    clickedElement.display="none";
		$('#'+titNodeId).removeClass(titNodeId + '_expanded').addClass(titNodeId + '_collapsed');
    if (document.getElementById('img_'+nodeId))
      document.getElementById('img_'+nodeId).src=document.getElementById('img_'+nodeId).src.replace('minus.gif',"plus.gif");
    state = 0;
  } else {
    if ((currentExpanded) && (collapsePrevious))
      currentExpanded.display = "none";
    currentExpanded=clickedElement;
    currentExpanded.display = dspl;
		$('#'+titNodeId).removeClass(titNodeId + '_collapsed').addClass(titNodeId + '_expanded');
    if (document.getElementById('img_'+nodeId))
    	document.getElementById('img_'+nodeId).src=document.getElementById('img_'+nodeId).src.replace("plus.gif",'minus.gif');
    state = 1;
  }
  if ($('#'+titNodeId).hasClass('persist_spoiler'))
	  SpoilerSaveState(nodeId, state);
  ToggledAlready=1;
}

function PurchaseBasket(o) {
	var PriceTotal = o.price ? o.price : $('#total_qbasket_summ').text();
	if (/,/.test(PriceTotal)) PriceTotal = parseFloat(PriceTotal.replace(',','.')).toFixed(2);
	var NeedMoney = (parseFloat(PriceTotal) - o.amount).toFixed(2);

	if (NeedMoney > 0) {
		if(NeedMoney<10) NeedMoney=10;

		if (litres.isNewPayment || litres.isNewPaymentBilling || litres.isNewPaymentBasket) {

			var newPaymentObj = {
				basket: 1,
				ref_url: socnet_ref_url
			};
			if (o.custom_set) {
				newPaymentObj.custom_set = o.custom_set;
			}
			Payment.open(newPaymentObj);

		} else {

			if($('#rebill-quick-purchase-bubble').length && o.basket) {
				$('#rebill-quick-purchase-bubble').overlay().load();
				rebill.price = PriceTotal;
				rebill.ref_url = '/pages/my_books_fresh/';
				if (o.custom_set) rebill.ref_url += '?custom_set='+o.custom_set;
				$('#rebill-quick-purchase-bubble .buy_download_popup_text').html(rebill.title);
				return;
			}
			var href = '';
			if (o.custom_set) {
				href = '/pages/put_money_on_account/?summ='+NeedMoney+'&custom_set='+o.custom_set;
			} else {
				href = '/?action=create_custom_set&buy_now=true&basket=true';
			}
			window.location.href = href;

		}

		return;
	}

	var CMess=ConfirmPay1+RubPrice(PriceTotal)+ConfirmPay2 + __l('и все отложенные книги будут куплены.') + ' '+ConfirmPay3;
	var CFunc = function exec() {
		var href = '/pages/my_books_fresh/';
		if (o.custom_set) href += '?custom_set='+o.custom_set;
		document.location.href=href;
	}
	alertBox.errorStickerButtons[0].value='OK';
	alertBox.alert(CMess,CFunc);
}


function TrendyWarnQuickBuy(Obj,Summ,PreOrder,Art,User,Price){
	var c_lass = Obj.className;
	var matches = c_lass.match(/free_get/); // free book download (gifts) class
	if (matches == null) {
		var Descr = __l('Cразу после этого вы сможете скачать эту книгу. ');
		if (PreOrder == 2){
			Descr = __l('Сразу после этого вы сможете продолжить чтение. ');
		} else if (PreOrder){
			Descr = __l('Сразу после этого ваш предзаказ будет принят и помещен в «Мои книги». ');
		}
		var CMess = ConfirmPay1+RubPrice(Summ)+ConfirmPay2+Descr+ConfirmPay3;
		var CFunc = function exec() {
			Obj.parentNode.submit();
		};
		// кто победит IE 6 в top.document.appendChild, дам конфетку
		if (window.parent == window.top || !/(MSIE)\s+6\D+/i.test(navigator.userAgent)){
			alertBox.errorStickerButtons[0].value='OK';
			alertBox.alert(CMess,CFunc);
		} else if (confirm(CMess)) CFunc();
	}
	if ( $.browser.msie ) { event.returnValue=false; }
	return false;
}

function TrendyWarnGift(Obj,Art){
	var CMess = __l('Cразу после этого у вас спишется 1 подарок и Вы сможете скачать эту книгу.');
	var CFunc = function exec() {
		top.window.location.href=Obj.getAttribute('href');
	};
	// кто победит IE 6 в top.document.appendChild, дам конфетку
	if (window.parent == window.top || !/(MSIE)\s+6\D+/i.test(navigator.userAgent)){
		alertBox.errorStickerButtons[0].value='OK';
		alertBox.alert(CMess,CFunc);
	} else if (confirm(CMess)) CFunc();
	return false;
}


var MetaCash = new Object;
function getMetaContents(mn){
	if (MetaCash[mn]) return MetaCash[mn];
	var m = document.getElementsByTagName('meta');
	for(var i in m){
		if (!MetaCash[mn]) MetaCash[mn] = m[i].content;
		if(m[i].name == mn) return m[i].content;
	}
	return '';
}

function decOfNum(number, titles)
{
    cases = [2, 0, 1, 1, 1, 2];
		number = number % 100 > 4 && number % 100 < 20 ? 2 : cases[Math.min(number % 10, 5)];
    return titles[number];
}

BodyEndFunc.push({'extinputs_init': function(){
/*default ref_url */
	def_ref_url=$('#login-bubble input[name=ref_url]').val();
	$(".ext-input").wrap('<span class="ext-input-wrap" />');
	$(".ext-button").each(function(){
		var wrap=$('<span class="ext-button-wrap" />');
		if ($(this).is('.ext-button-green')) wrap.addClass('ext-button-wrap-green');
		if ($(this).is('.ext-button-gray')) wrap.addClass('ext-button-wrap-gray');
		$(this).wrap(wrap);
	});
	if(!placeholders_supported) {
		$(':input[placeholder]').each(function(){
			$(this).placeholder();
		});
	}

    	$("input.inum").bind('keydown',function(event) {
		if( event.keyCode != 46 && event.keyCode != 86 && event.keyCode != 8 && event.keyCode != 9 && event.keyCode != 37 && event.keyCode != 39 &&
			  (event.keyCode < 48 || (event.keyCode > 57 && event.keyCode < 96) || event.keyCode > 105) ) {
			event.preventDefault();
		}
	});

    $("input.inum").bind('keyup blur',function(){
        var t = $(this);
        t.val(t.val().replace(/[^\d]/g, ''));
    });

	$(".login-link, .login-link-car").click(function() {
		$("#login-bubble").data('overlay').load();
		return false;
	});


	/*,  */

	if (document.getElementById('download_drm1')){
		$("#download_drm1").overlay({
			fixed:false,
			// effect: 'apple',
			speed:10,
			onClose: function() {$.mask.close();},
			onLoad:function() {
				$(document).mask({
					color: '#000',
					loadSpeed: 200,
					opacity: 0.7,
					onBeforeClose: function() {
						$("#download_drm1").data("overlay").close();
					}
				});
			}
		});
		$('.buttons_load .cancel').click(function(){
			$("#download_drm1").data("overlay").close();
		});
	}


	if (document.getElementById('en_drm')){
	$("#en_drm").overlay({
		fixed:false,
		// effect: 'apple',
		speed:100,
		onClose: function() {$.mask.close();},
		onLoad:function() {
			$(document).mask({
				color: '#000',
				loadSpeed: 200,
				opacity: 0.7,
				onBeforeClose: function() {
					$("#en_drm").data("overlay").close();
				}
			});
		}
	});}

	/* others book in popup */
	if (document.getElementById('others-link')){
	$("#others-link").overlay({
		fixed:false,
		// effect: 'apple',
		speed:100,
		onClose: function() {$.mask.close();},
		onLoad:function() {
			$(document).mask({
				color: '#000',
				loadSpeed: 200,
				opacity: 0.7,
				onBeforeClose: function() {
					$("#others-link").data("overlay").close();
				}
			});
		}
	});}


	if (document.getElementById('lock_mini_drm')){
	$("#lock_mini_drm").overlay({
		fixed:false,
		// effect: 'apple',
		speed:100,
		onClose: function() {$.mask.close();},
		onLoad:function() {
			$(document).mask({
				color: '#000',
				loadSpeed: 200,
				opacity: 0.7,
				onBeforeClose: function() {
					$("#lock_mini_drm").data("overlay").close();
				}
			});
		}
	});}

	/* readers main page */
	$('.filter_links > td > a').click(function(){
		$('#min_price').val("");
		$('#max_price').val("");
		if ($(this).index() == 0) $('#max_price').val('3000');
		else if ($(this).index() == 1) { $('#min_price').val('3000'); $('#max_price').val('5000'); }
		else if ($(this).index() == 2) $('#min_price').val('5000');
	});

	/* buy free books */
	var free_data, free_price;
	$('a.free_get').click(function(){
		free_data = gift_data[$(this).attr('rel')];
		if (free_data.free_amount<=20) {
		$('#hg-pop-tooltip').addClass('free_book_get');
		free_price = $(this).attr('onclick').split(',')[1] + ' <span class="litres_ruble">&#8381;</span>';
		$('#hg-pop-tooltip').css({left:$(this).offset().left-79,top:$(this).offset().top+10}).show();
		if (free_price == null) {
			free_price = $('.book_descr_links').children('.td').children('.simple_price').html();
			$('#hg-pop-tooltip').css({left:$(this).offset().left-15,top:$(this).offset().top+40}).show();
		}
		$('#hg-pop-tooltip .close').show();
		$('#hg-content').html('<div id="free-download">'+
				'<a href="'+free_data.href2+'" class="coolbtn btn-blue-18"><u></u>' + __l('Скачать бесплатно') + '<s></s></a>'+
				(free_data.free_amount<=10?'<p class="free-d-text'+(free_data.free_amount>9?" free_alt":"")+'">' + __ln('<span>{count}</span>книгу еще можно<br/>скачать бесплатно', 'книг еще можно<br/>скачать бесплатно', free_data.free_amount, {count: free_data.free_amount}) + '</p>':'')+
				'<p class="free-d-text2">' + __l('Не хотите по подписке?') + '</p>'+
				'<a href="'+free_data.buy+'" onclick="'+$(this).attr('onclick')+'" class="buy-book">' + __l('Купить за {price}', {price: free_price}) + '</a>'+
			'</div>');
		$('#hg-overlay').show();
		return false;
	} else document.location = free_data.href2;
	});

	/* stars */
	var art, tooltip, mark, i;
	genstars = function(t, mark) {
		t.html("");
		art = stars_data['a_'+t.attr('id')];
		if (mark) {
			art.votes[mark-1]++;
			if (art.voted) art.votes[art.voted-1]--;
			else art.vote_amount++;
			if (art.mid_vote == 0 && art.vote_amount == 1) art.mid_vote = mark;
			else {
				var tmp = 0;
				for(i=1;i<=5;i++) tmp += art.votes[i-1]*i;
				art.mid_vote = (tmp/art.vote_amount).toFixed(2);
			}
			art.voted = mark;
		}
		var tmp2 = art.mid_vote;
		tmp2 = tmp2.toString().substr(2);
		tmp2 = tmp2.length == 1?tmp2+'0':tmp2;
		for(i=1;i<=5;i++) {
			var a_class = "";
			if (art.mid_vote < i && art.mid_vote > i-1 && tmp2 >= 26 && tmp2 <= 75) a_class = " voted-half";
			else if ((art.mid_vote >= i && ((art.voted > 0 && art.vote_amount > 1) || (art.voted == 0 && art.vote_amount > 0))) ||
				(art.voted >=i && art.vote_amount == 1) ||
				(art.mid_vote < i && art.mid_vote > i-1 && tmp2 >= 76)) a_class = " voted";
			t.append('<a href="javascript:void(0);" class="star'+a_class+'" id="'+i+'"><span></span></a>');
		}
		if (!t.hasClass('bigstars')) {
			t.children('a:last').css("padding-right", "4px");
		} else {
			var star_close = $('.bigstars').html();
			var vote_number = art.vote_amount > 0 ? '<span class="votes">(<span>'+art.vote_amount+'</span>)</span>' : '';
			$('.bigstars').html('<div class="g_star"><span class="item">'+star_close+'</span>'+vote_number+'</div>');
		}
	};

	$('.stars_book').each(function() {
		genstars($(this));
	});

	$('.stars_book a').live('click', function() {
		var parent = $(this).closest('.stars_book');
		var id = parent.attr('id');
		art = stars_data['a_'+id];
		mark = $(this).attr('id');
		if (art.logined == 0) {
			$("#login-bubble").data("overlay").load();
			$('#login-bubble input[name=ref_url]').val($('#login-bubble input[name=ref_url]').val() + ($('#login-bubble input[name=ref_url]').val().match(/\?/)?'&':'?')+'action=votestars&art='+id+'&mark='+mark+'&rand='+Math.random());
			return false;
		} else {
			if (mark != art.voted) {
				if (mark >= 1 || mark <= 5 || id) {
					var Request = {
						url: '/pages/ajax_epmty/',
						OnData:function(Data) {
							if (Data == 'ok') {
								genstars(parent, mark);
							} else if (/already_voted/.test(Data[0])) alert(__l("Вы уже голосовали за это произведение."));
							else alert(__l("Произошла ошибка: ")+Data[0]);
						},
						params: {action:'votestars', art:id, mark:mark, rand:Math.random()}
					};
					GUJ.PutRequest(Request);
				}
			} else return false;
		}
	});

	$('.stars_book a').live('mouseenter', function() {
		/* 22715 */
		if ($('.new-book-over-cover .download-links .formats a').length > 0)
			$('.new-book-over-cover .download-links .formats a').removeClass('clicked')

		$("#hg-pop_close").hide();
		$(this).prevAll().andSelf().addClass('star-hover');
		var parent = $(this).closest('.stars_book');
		art = stars_data['a_'+parent.attr('id')];
		var max_vote = Math.max.apply(null, art.votes);
		tooltip = (art.voted==0?'<p class="vote-info">' + __l('Оценить книгу на {vote}!', {vote: $(this).attr('id')}) + '</p>':'')+
			'<p class="voted-info">' + __ln('Всего {vote_amount} оценка.', 'Всего {vote_amount} оценок.', art.vote_amount, {vote_amount: art.vote_amount}) + '<br />' + __l('Средняя оценка {vote}.', {vote: art.mid_vote}) + '</p>'
			+(art.voted?'<p class="old-vote-info">' + __l('Моя оценка {voted}.', {voted: art.voted}) + '</p>'+(art.voted != $(this).attr('id') ? '<p class="vote-info">' + __l('Изменить на {vote}!', {vote: $(this).attr('id')}) + '</p>' : '<p class="vote-info">' + __l('Оставить оценку') + '</p>') :'');
		var table = '<dl>';
		for(i=5;i>0;i--)
			table += '<dt'+(art.voted==i?' class="alt"':"")+'>'+i+'</dt>'+
				'<dd'+(art.voted==i?' class="alt"':"")+'><div style="width:'+(art.votes[i-1]==0?0:Math.floor(100*art.votes[i-1]/max_vote))+'px;"></div><span>('+art.votes[i-1]+')</span></dd>';
		table += '</dl>';
		$('#hg-content:not(.langs)').addClass('votestars').html(tooltip+table);
		if ($(this).closest('bigstars')) $('#hg-pop-tooltip').css({left:parent.offset().left-44,top:parent.offset().top+21}).show();
		else $('#hg-pop-tooltip').css({left:parent.offset().left-58,top:parent.offset().top+15}).show();
	});

	$('.stars_book a').live('mouseleave', function() {
		$(this).prevAll().andSelf().removeClass('star-hover');
		$('#hg-pop-tooltip').hide();
		$('#hg-content').removeClass('votestars');
	});
	/* buy and download register button */
	if ($('.login-link').length) {
		$('.escho_oplat_popup a').click(function(){
			$("#buy_book_data").slideUp(200,function(){
				$("#login-bubble").data("overlay").load();
				$("#div-quick-login").hide();
				$("#div-quick-reg").show();
			});
			return false;
		});
	}

	$('#buy_book_data a.close').click(function(){
		$("#buy_book_data").data("overlay").close();
		if ($('.anonym-sms-buy').length > 0){ $('.anonym-sms-buy').remove(); }
		if ($('.anonym-webmoney-buy').length > 0){ $('.anonym-webmoney-buy').remove();}
		$('.anonym-pay-buy').show();
		$.mask.close();
	});

	/* quick recommend */
	if ($('.upsale_read .ur_desc').length) {
		var w = $(window), c = $('.cover');
		if(w.width() <= 600) c.hide();
		$(w).resize(function() {
			if(w.width() <= 600) c.hide();
			else c.show();
		});
	}

	function a_buyany(){
	  var buy_book_data = $('#buy_book_data');
	  if (buy_book_data.length) {
		buy_book_data.data('overlay').load();
	  }
	}

	function a_buypay_webmoney(){
	  $('#a_buypay_webmoney').trigger('click');
	}

	$('#a_buypay_webmoney').click(function(e){
	  e.preventDefault();
	  e.stopPropagation()
	  WebMoney_OneClick();
	});

	$('#a_buypay_sms').click(function(e){
	  a_buypay_sms_init();
	  e.preventDefault();
	});

	function a_buypay_sms_init(){
	  op_change_link = '<a href="javascript:void(0)" class="change_op">' + __l('изменить оператора') + '</a>';
		$('.pay_ments').css('opacity', '1');
		$('.anonym-pay-buy').slideUp(200, function(){
			var _url = '/pages/biblio_basket/';
			var _params = {
					action: 'create_custom_set'
			};
			var custom_set = false;
			if (window.location.href.match('custom_set') !== null) {
				custom_set = window.location.href.split('?')[1].split('=')[1];
			}
			if (!custom_set) {
				var basket = 1;
				var ord_title = false;
				var ref_urla = "/pages/put_money_on_account/?descr=10&sms_popup=1" +
					"&ref_url=" + encodeURIComponent("/pages/my_books_fresh/");
				if ($('#a_buypay_sms').parent('form').length > 0) {
					basket = 0;
					var art_id = $('#a_buypay_sms').prevAll('input[name=arts]').val();
					ord_title = $('#a_buypay_sms').prevAll('input[name=ord_title]').val();
					var tmp = $('#a_buypay_sms').prevAll('input[name=redir]').val().split("?");
					tmp = tmp[1].split("&");
					var tmp_;
					for(var i = 0; i < tmp.length; i++) {
						tmp_ = tmp[i].split("=");
						sms_arr[tmp_[0]] = tmp_[1];
					}
					ref_urla += "&summ="+sms_arr['summ'];
				}
				_params.redir = ref_urla;
				if (basket) {
					_params.basket = true;
				} else {
					_params.ord_title = ord_title;
					_params.arts = art_id;
				}
			} else {
				_url = '/pages/put_money_on_account/';
				_params = {
					descr: 10,
					sms_popup: 1,
					custom_set: custom_set
				};
			}
			var get_sms_data = {
				url: _url,
				params: _params,
				OnHTML: function (HTML) {
					$('.sms_data_status').remove();
					$('.anonym-sms-buy .gray-corners').html(HTML);
					// alert(op[0]['summ_need']+' '+op[0]['custom_set']+' '+op[0]['order_id']+' '+op[0]['small_id']+' '+op[0]['country_id']+' '+op[0]['ref_url']);
					p_url = '&summ='+op[0]['summ_need']+'&ref_url='+op[0]['ref_url']+(op[0]['custom_set'] ? '&custom_set='+op[0]['custom_set'] : '');
					var tmp2 = '<div class="kykyru-footer-add-alt">'+
						'<ul class="pay_ments"><li><a href="javascript:void(0)" class="p_other">' + __l('Другие способы оплаты') + '</a></li>';
					for (m in other_pays)
						tmp2 += '<li><a href="/pages/put_money_on_account/?'+other_pays[m]+p_url+'" class="'+m+'" title="'+pays_titles[m]+'"></a></li>';
					$('.anonym-sms-buy').append(tmp2+'</ul></div>');
					if (smspopState != 0) {
						if (smspopState == 22 || smspopState == 42 || smspopState == 92 || smspopState == 44) {
							$('.operators li#'+smspopState+' a').trigger('click');
						}else {
							$('#country-change select option').attr('selected', '');
							$('#country-change select option[value=' + (smspopState == 57 ? 3 : 1) +']').attr("selected", "selected").trigger('change');
							$('#operator-change select option').attr('selected', '');
							$('#operator-change select option[value='+smspopState+']').attr("selected", "selected").trigger('change');
							return;
						}
						smspopState = 0;
					}
					set_step(1); // step
				}
			};
			CSRF.sendRequest(get_sms_data);
			$(this).after('<div class="anonym-sms-buy"><div class="buy_download_popup_text">'+$('.buy_download_popup_text').html()+'</div></div>');
			$('.anonym-sms-buy .buy_download_popup_text p').html(__l('Если вы уже регистрировались или покупали книги на нашем сайте,<br />воспользуйтесь <a href="/pages/login/">входом в систему</a> для пополнения своего счета.'));
			$('.anonym-sms-buy .buy_download_popup_text strong').html(__l('Оплата со счета мобильного телефона.'));
			$('.anonym-sms-buy').append('<p id="sms-step-text">' + __l('Выберите оператора:') + '</p>'+
				'<div class="gray-corners corners"><div class="sms_data_status"><img alt="" src="/static/new/i/ajax_progress.gif" width="16" height="16" /></div></div>');
			$('.anonym-sms-buy').slideDown(200);
		});
		return false;
	}

	/* book page */
	if ($("#buy_book_data").length > 0){
		$("#buy_book_data").overlay({
			fixed: false,
			// effect: 'apple',
			speed: 100,
			// onClose: function() {$.mask.close();},
			onLoad:function() {
				$(document).mask({
					color: '#000',
					loadSpeed: 200,
					opacity: 0.7,
					onBeforeClose: function() {
						$('#buy_book_data').data("overlay").close();
						if ($("#login-bubble").length) $("#login-bubble").data("overlay").close();
						if ($('.anonym-sms-buy').length) { $('.anonym-sms-buy').remove(); }
						if ($('.anonym-webmoney-buy').length) { $('.anonym-webmoney-buy').remove(); }
						if ($('.anonym-pay-buy').length) $('.anonym-pay-buy').show();
					}
				});
			}
		});
		if (window.location.hash === '#buy_now_noreg' && $('.new-book').length) {
			$("#buy_book_data").data('overlay').load();
		}
	}

	$('#a_buyany').click(function(){a_buyany();});

	if (window.location.hash === '#buy_now_reg' && $('.new-book').length) {
		$('#reg_buynow a, #reg_buynow button').click();
	}

	/* liters_touch lister */
	if ($('.litres_touch .okno').length > 0) {
		$('.okno .cell:first').addClass('c_current').addClass('a_active');
		$('.rakurs .arrow_down').click(function(){
			var cur = $('.okno .c_current');
			tmp = (cur.index()+1)*81;
			if (tmp == 405 || !cur.next().size()) {
				num = 0;
				$('.okno .cell:first').addClass('c_current');
				cur.removeClass('c_current');
			} else if (cur.next().size()) {
				cur.removeClass('c_current').next().addClass('c_current');
				num = tmp;
			}
			$('.okno .inner').css("margin-top", "-"+num+"px");
			return false;
		});

		rotate = function(){
			var act = $('.okno .a_active');
			act.removeClass('a_active');
			if (act.next().size())
				a_next = act.next().addClass('a_active');
			else
				a_next = $('.okno .cell:first').addClass('a_active');
			$('.device img').fadeOut(200, function(){
				$('.device img').attr("src", "/static/new/i/"
				+((!$('.litres_touch').hasClass('prize'))?"litres_touch/device_":"greedy/bookine-device_")+a_next.index()+".jpg").fadeIn(300, function(){});
			});

		};

		var gg = setInterval('rotate()', 3000);
		$('.okno, .pic').hover(function(){
			gg = window.clearInterval(gg);
		}, function(){
			gg = setInterval('rotate()', 3000);
		});

		$('.rakurs .arrow_up').click(function(){
			var cur = $('.okno .c_current');
			tmp = (cur.index()-1)*81;
			if (tmp == 0) {
				num = 0;
				cur.removeClass('c_current').prev().addClass('c_current');
			} else if (!cur.prev().size()) {
				num = 243;
				cur.removeClass('c_current');
				$('.okno .cell:eq(3)').addClass('c_current');
			} else if (cur.prev().size()) {
				num = tmp;
				cur.removeClass('c_current').prev().addClass('c_current');
			}
			$('.okno .inner').css("margin-top", "-"+num+"px");
			return false;
		});

		$('.okno .cell').click(function(){
			$('.okno .cell').removeClass('a_active');
			$(this).addClass('a_active');
			$('.device img').attr("src", "/static/new/i/"
			+((!$('.litres_touch').hasClass('prize'))?"litres_touch/device_":"greedy/bookine-device_")+$(this).index()+".jpg");
			return false;
		});
	}

	if (document.getElementById('youtube-popup')){
		$("#youtube-popup").overlay({
			fixed:false,
			// effect: 'apple',
			speed:100,
			onClose: function() {$.mask.close();},
			onLoad:function() {
				$(document).mask({
					color: '#000',
					loadSpeed: 200,
					opacity: 0.7,
					onBeforeClose: function() {
						$("#youtube-popup").data("overlay").close();
					}
				});
			}
		});
	}

	$('#youtube-popup').click(function(){
		$("#youtube-popup").data('overlay').load();
	});

	if (document.getElementById('instruction-popup')){
		$("#instruction-popup").overlay({
			fixed:false,
			// effect: 'apple',
			speed:100,
			onClose: function() {$.mask.close();},
			onLoad:function() {
				$(document).mask({
					color: '#000',
					loadSpeed: 200,
					opacity: 0.7,
					onBeforeClose: function() {
						$("#instruction-popup").data("overlay").close();
					}
				});
			}
		});
	}

	$('#instruction-popup').click(function(){
		$("#instruction-popup").data('overlay').load();
	});

	// remove all, see other payment methods
	$('a.p_other').live('click', function(){
		$('.anonym-sms-buy').remove(); $('.anonym-pay-buy').show(); return false;
	});

	// pop-up sms payment
	var sms_arr = new Array(), op_change_link, fee, sms_text, p_url, o_id, o_cap, art_name = "", smspopState = 0;
	var other_pays = {"p_visa":"descr=32", "p_mastercard":"descr=32", "p_alfa":"descr=41", "p_kykyru":"descr=44", "p_paypal":"descr=62",
		"p_wm":"descr=50", "p_yad":"descr=55", "p_qiwi":"descr=7"};// TODO: установить pw_qiwi descr = 51 когда починят QIWI
	var pays_titles = {"p_visa":"Visa", "p_mastercard":"MasterCard", "p_alfa":__l("Альфа-Клик"), "p_kykyru":__l("Карта «Кукуруза»"), "p_paypal":"PayPal",
		"p_wm":"WebMoney", "p_yad":__l("Яндекс.Деньги"), "p_qiwi":__l("QIWI кошелек")};

	// show country select
	$('.change_country').live('click', function(){
		$('.country-name').hide(); $('#country-change').show(); return false;
	});

	// country change
	$('#country-change select').live('change', function(){
		if ($(this).val() == 0) return false;
		var id = $(this).val();
		$('#country-change').hide();
		$('.country-name p').text($('#country-change option:selected').text());
		$('.country-name, #operator-change').show();
		$('.operators li:not(.tarif, #operator-change)').remove();
		var tmp = '', count = 0;
		for (key in sms) {
			if (key != 0 && sms[key]['c_id'] == id) {
				if (count < 3 && id != 1)
					$('.operators ul').prepend('<li id="'+key+'"><a href="javascript:void(0)">'+sms[key]['cap']+'</a></li>');
				count++;
				tmp += "<option value=\""+key+"\">"+sms[key]['cap']+"</option>";
			}
		}
		if (id == 1) {
			$('.operators ul').prepend('<li class="id_42" id="42"><a href="javascript:void(0)">' + __l('Билайн') + '</a></li>'+
				'<li class="id_22" id="22"><a href="javascript:void(0)">' + __l('МТС') + '</a></li>'+
				'<li class="id_92" id="92"><a href="javascript:void(0)">' + __l('Мегафон') + '</a></li>'+
				'<li class="id_44" id="44"><a href="javascript:void(0)">' + __l('Tele2') + '</a></li>');
		}
		if (count > 3) $('#operator-change select').html('<option value="0">' + __ln('Другой ({count} оператор)', 'Другой ({count} операторов)', count, {count: count}) + '</option>'+tmp);
		else {
			$('#operator-change span select').html('');
			$('#operator-change').hide();
		}
		set_step(1); // step
	});

	// change operator click
	$('.change_op').live('click', function(){
		step_back();
		// $('.anonym-sms-buy .gray-corners').css('margin', '13px 8px 0');
		// $('.operators li.op_a').html('<a href="javascript:void(0)">'+$('.operators li.op_a span').html()+'</a>');
		// $('.operators li:not(#operator-change)').removeClass('op_a').show();
		// if ($('#operator-change span select option').length) $('#operator-change').show();
		// $('#sms-step-text, #sms-popup-start, .anonym-sms-buy .buy_download_popup_text p, .anonym-sms-buy .buy_download_popup_text strong, .anonym-sms-buy .kykyru-footer-add-alt').show();
		// $('.operators li.tarif, .nosms-data').hide();
		// $('.op-info, .op-data').remove();
		return false;
	});

	// other operators select change + click
	$('#operator-change select').live('change', function(){
		if ($(this).val() == 0) return false;
		o_id = $(this).val();
		o_cap = $('#operator-change option:selected').text();
		if (o_id == 42 || o_id == 22 || o_id == 92 || o_id == 44) {
			$('.operators li.op_a').html('<a href="javascript:void(0)">'+$('.operators li.op_a span').html()+'</a>');
			$('.operators li').removeClass('op_a');
			$('.operators li#'+o_id).addClass('op_a').show();
			$('.operators li#'+o_id+' a').trigger('click');
			changeTarif(o_id);
		} else $('#postpay').trigger('click');
	});

	// operator click beeline, mts, megafon
	$('.operators li:not(.tarif) a').live('click', function(){
		if ($(this).parent().hasClass('id_42') ||
		$(this).parent().hasClass('id_22') ||
		$(this).parent().hasClass('id_92') ||
		$(this).parent().hasClass('id_44')) {
			if (!$(this).parent().hasClass('op_a')) $(this).parent().addClass('op_a');
			changeTarif($('.operators li.op_a').attr('id'));
			$('.operators li:not(.op_a, .tarif)').hide();
			$('.operators li.tarif').show();
			$(this).replaceWith('<span>'+$(this).text()+'</span>');
			// if (op[$('.operators li.op_a').attr('id')] == undefined) { no_sms($(this).text()); return false; }
			return false;
		}
		o_id = $(this).parent().attr('id');
		o_cap = $(this).text();
		$('#postpay').trigger('click');
		return false;
	});

	function changeTarif(id){
		if (id == 42)	{
			$('#prepay').html(__l('Предоплатный тариф для частных лиц'));
			$('#postpay').html(__l('Постоплатный или корпоративный тариф'));
		} else {
			$('#prepay').html(__l('Тариф для частных лиц'));
			$('#postpay').html(__l('Корпоративный тариф'));
		}
	}

	// tarif click for beeline, mts, megafon
	$('#prepay').live('click', function(){
		set_step(2); // step
		var comm = { '42': 18.9, '92': 16.5, '44': 17.9 };
		var operator_text = $('.operators li.op_a').attr('id');
		var operator_name = $('.operators li.op_a').text();
		var summ_proc, summ_res;
		if (operator_name == 'МТС') {
			summ_proc = 10;
			summ_res = parseFloat(op[0]['summ_need']) + 10;
		} else if (operator_name == __l('Билайн')) {
			summ_proc = parseFloat((parseInt(op[0]['summ_need'] * comm[operator_text]) / 100) + 10).toFixed(2);
			summ_res = parseFloat(parseInt(op[0]['summ_need'] * (100 + comm[operator_text])) / 100) + 10;
		} else {
			summ_proc = parseFloat(parseInt(op[0]['summ_need'] * comm[operator_text]) / 100);
			summ_res = parseFloat(parseInt(op[0]['summ_need'] * (100 + comm[operator_text])) / 100);
		}
		$('.anonym-sms-buy .buy_download_popup_text p, .anonym-sms-buy .buy_download_popup_text strong').hide();
		$('#sms-popup-start').hide().after('<div class="op-info">' + __l('Ваш оператор: <b>{operator_name}</b> (предоплатный)', {operator_name: operator_name}) + op_change_link+'<br />'+
			__l('Сумма к оплате: <span>{summ} <span class="litres_ruble">{rub}</span></span> включая комиссию {summ_proc} <span class="litres_ruble">{rub}</span></div>', {summ: summ_res, rub: '&#8381;', summ_proc: summ_proc, rub: '&#8381;'}) );
		$('.anonym-sms-buy .gray-corners').css('margin', '2px 8px 16px').after('<div class="op-data"><span class="some-text">' + __l('Введите номер своего мобильного телефона:') + '</span>'+
			'<div class="user-phone">+7<span class="ext-input-wrap"><input class="ext-input" name="phone" id="phone"/></span>'+
			'<button id="prepay-next" class="coolbtn btn-blue-18" value="ОК" type="submit"><u></u>ОК<s></s></button></div>'+
			'<p>' + __l('На указанный номер будет отправленно SMS<br />с запросом на проведение платежа.') + '</p></div>');
		$('#sms-step-text').hide();
		return false;
	});

	// 2nd step for beeline, mts, megafon
	$('#prepay-next').live('click', function(){
		if ($('.phone-error')) $('.phone-error').remove();
		if ($('#phone').val().length == 0 ||
			($('#phone').val().length && $('#phone').val().match(/\d+/gi).join('').length < 7)) {
				$('.some-text').after('<div class="phone-error">' + __l('Ошибка: неверный формат номера') + '</div>');
				return false;
			}
		set_step(3); // step
		$('.pay_ments').css('opacity', '0.4');
		$('.pay_ments li a').each(function(i){ $(this).replaceWith('<span class="'+$(this).attr('class')+'">'+$(this).text()+'</span>'); });
		// pages/proceed_payment/?descr=65&summ=11&phone_number=9161112233&js=true В ответе будет JSON с id ордера
		// ajax post www.fbhub.ru/pages/ajax_create_order/?summ=300&service=mc&service_id=9111234567&custom_set=12345
		var Request = {
			url: '/pages/proceed_payment/',
			params: {
				descr: 65,
				summ: op[0]['summ_need'],
				phone_number: $('#phone').val(),
				custom_set: op[0]['custom_set'],
				js: true
			},
			HttpRType: 'json',
			OnData: function(Data){
				if (Data == '' || Data.error){
					alert(Data.error);
				} else {
					check_sms(65, Data.id);
				}
			}
		};
		GUJ.PutRequest(Request);
		$('.user-phone, .some-text').remove();
		$('.op-data p').before('<div class="sms-progress prepay-final-text">' + __l('Ожидание подтверждения платежа. Не закрывайте это<br />окошко и не переходите на другую страницу до получения<br /> SMS уведомления о завершении операции.') + '</div>')
			.html(__l('Выполнение платежа и отправка SMS может занять несколько минут.'));
		$('.anonym-sms-buy .buy_download_popup_text').css('padding-bottom', '9px').append('<strong style="padding-top:27px;">' + __l('Подтвердите платеж:') + '</strong>');
		$('.anonym-sms-buy .gray-corners').html(
			'<div id="sms-buy-final">' +
				(
					$('.operators li.op_a').attr('id') == 22
						? __l('После того, как Вам пришло SMS с короткого номера, проверьте детали платежа и отправьте ответное SMS на этот номер с любым текстом или пустое.')
						: __l('После того, как Вам пришло SMS с короткого номера, проверьте детали платежа и отправьте ответное SMS<br />с указанной цифрой на этот номер.')
				) +
			'</div>');
		return false;
	});

	// postpay click and other operators click
	$('#postpay').live('click', function(){
		set_step(2); // step
		if ($('.operators li.op_a').attr('id')) {
			o_id = $('.operators li.op_a').attr('id');
			o_cap = $('.operators li.op_a span').text();
		}
		if (op[o_id] == undefined) { no_sms(o_cap); return false; }
		cost = op[o_id]['currency'] == 'р.' ? op[0]['summ_need'] : op[0]['summ_need']/op[o_id]['course'];
		$('.anonym-sms-buy .buy_download_popup_text p, .anonym-sms-buy .buy_download_popup_text strong').hide();
		var tmp_ = $('.operators li.op_a').attr('id') == '42' || $('.operators li.op_a').attr('id') == '22' || $('.operators li.op_a').attr('id') == '92' ?' ' + __l('(постоплатный)'):'';
		$('#sms-popup-start').hide().after('<div class="op-info">' + __l('Ваш оператор:') + ' <b>'+o_cap+'</b>'+tmp_+''+op_change_link+'<br />'+
			op[o_id]['currency'] == 'р.'
				? __l('Стоимость SMS составит<span> {cost} <span class="litres_ruble">{rub}</span>*</span>', {cost: op[o_id]['cost'], rub: '&#8381;'})
				: __l('Стоимость SMS составит<span> {cost} {currency}*</span>', {currency: op[o_id]['currency']}));
		var tmp2 = '<div class="op-data postpay"><span class="some-text">' + __l('Отправьте на номер <strong>{number}</strong> SMS с текстом:', {number: op[o_id]['number']}) + '</span>'+
			'<div class="op-sms-text">';
		sms_text = op[o_id]['prefix']+' '+op[0]['small_id'];
		for(var i = 0; i < sms_text.length; i++) {
			tmp2 += '<span'+(i > (sms_text.length-5) && i < (sms_text.length-1) ? ' class="alt"':'')+'>'+sms_text.substr(i, 1)+'</span>';
		}
		tmp2 += '</div><small>' + __l('Внимание! Пробел между {prefix} и числом {small_id} обязателен.', {prefix: op[o_id]['prefix'], small_id: op[0]['small_id']}) + '</small><br />'+
			'<a href="javascript:void(0);" id="postpay-next">' + __l('Нажмите сюда после отправки SMS') + '</a>';
		if (op[o_id]['course'] > 0 || op[o_id]['currency'] == 'р.') {
			sms_cost = op[o_id]['currency'] == 'р.' ? op[o_id]['summ'] : op[o_id]['summ']/op[o_id]['course'];
			fee = (op[o_id]['cost'] - sms_cost).toFixed(2);
			money = ((op[o_id]['cost'] - fee - cost)*op[o_id]['course']).toFixed(2);
			tmp2 += op[o_id]['currency'] == 'р.'
				? __l('<p>* Стоимость включает НДС. Комиссия оператора {fee} <span class="litres_ruble">{rub}</span>, остаток средств<br /> в размере {money} <span class="litres_ruble">{rub}</span> будет доступен для дальнейших покупок.</p></div>', {fee: fee, money: money, rub: '&#8381;'})
				: __l('<p>* Стоимость включает НДС. Комиссия оператора {fee} {currency}, остаток средств<br /> в размере {money} <span class="litres_ruble">{rub}</span> будет доступен для дальнейших покупок.</p></div>', {fee: fee, currency: op[o_id]['currency'], money: money, rub: '&#8381;'});
		}
		$('.anonym-sms-buy .gray-corners').css('margin', '2px 8px 16px').after(tmp2);
		$('#sms-step-text').hide();
		return false;
	});

	// 2nd step for 3big and other operators
	$('#postpay-next').live('click', function(){
		set_step(3); // step
		$('.pay_ments').css('opacity', '0.4');
		$('.pay_ments li a').each(function(i){ $(this).replaceWith('<span class="'+$(this).attr('class')+'">'+$(this).text()+'</span>'); });
		check_sms(10, op[0]['order_id']);
		$('.anonym-sms-buy .gray-corners').before('<p class="sms-progress">' + __l('Ожидается SMS «{sms_text}» на номер {number}...', {sms_text: sms_text, number: op[o_id]['number']}) + '</p>')
			.html(
				'<div id="sms-buy-final">'+
					__l('После завершения покупки на ваш телефон придет SMS, содержащая логин и пароль для повторного доступа на сайт.') + '<br />'+
					__l('Купленная книга будет храниться в он-лайн библиотеке неограниченное время.') +
				'</div>');
		$('.postpay').removeClass('postpay').addClass('postpay-next').html(
			'<p>' +
				__l('Если Вы отправили SMS, но ничего не происходит в течение 3 минут,<br />обновите страницу. Если это также не помогло, войдите в систему с помощью<br />логина и пароля, полученными в сообщении с подтверждением оплаты.') +
			'</p>');
		return false;
	});

	// error message
	no_sms = function(cap){
		$('.anonym-sms-buy .buy_download_popup_text p, .anonym-sms-buy .buy_download_popup_text strong, .anonym-sms-buy .kykyru-footer-add-alt').hide();
		$('#sms-popup-start').hide().after('<div class="op-info">' + __l('Ваш оператор:') + ' <b>'+cap+'</b> '+op_change_link+'<br /><span class="no-sms">' + __l('Стоимость книги превышает максимальную стоимость SMS.') + '</span></div>');
		$('.anonym-sms-buy .gray-corners').css('margin', '2px 8px 16px').after('<div class="nosms-data">'+
			'<p>' + __l('Вариант 1. <a id="p_reg" href="/pages/registration/">Зарегистрируйтесь</a>, пополните счет несколькими SMS<br />и самостоятельно завершите покупку.') + '</p>'+
			'<p>' + __l('Вариант 2. Оплатите покупку другим способом:') + '</p>'+
			'<ul class="pay_ments">'+
			'<li><a href="/pages/put_money_on_account/?descr=32'+p_url+'" class="p_visa" title="Visa"></a><a href="/pages/put_money_on_account/?descr=32'+p_url+'" class="p_mastercard" title="MasterCard"></a>'+
				'<a href="/pages/put_money_on_account/?descr=62'+p_url+'" class="p_paypal" title="PayPal"></a></li>'+
			'<li class="p_link"><a href="/pages/put_money_on_account/?descr=32'+p_url+'">' + __l('Кредитная или дебетовая карта Visa, MasterCard, Maestro') + '</a></li>'+
			'<li class="p_link"><a href="/pages/put_money_on_account/?descr=62'+p_url+'">PayPal</a></li>'+
			'</ul><ul class="pay_ments pay_second">'+
			'<li><a href="/pages/put_money_on_account/?descr=50'+p_url+'" class="p_wm" title="WebMoney"></a><a href="/pages/put_money_on_account/?descr=55'+p_url+'" class="p_yad" title="' + __l('Яндекс.деньги') + '"></a>'+
				'<a href="/pages/put_money_on_account/?descr=51'+p_url+'" class="p_qiwi" title="' + __l('QIWI кошелек') + '"></a></li>'+
			'<li class="p_link"><a href="/pages/put_money_on_account/?descr=50'+p_url+'">' + __l('WebMoney') + '</a></li>'+
			'<li class="p_link"><a href="/pages/put_money_on_account/?descr=55'+p_url+'">' + __l('Яндекс.деньги') + '</a></li>'+
			'<li class="p_link"><a class="p_qiwi_link" href="/pages/put_money_on_account/?descr=51'+p_url+'">' + __l('QIWI кошелек') + '</a></li>'+
			'</ul><ul class="pay_ments pay_last">'+
			'<li><a href="/pages/put_money_on_account/?descr=41'+p_url+'" class="p_alfa" title="' + __l('Альфа-Клик') + '"></a><a href="/pages/put_money_on_account/?descr=44'+p_url+'" class="p_kykyru" title="' + __l('Карта «Кукуруза»') + '"></a>'+
				'<a href="/pages/put_money_on_account/?descr=57'+p_url+'" class="p_thanks" title="' + __l('Сбасибо от сбербанка') + '"></a></li>'+
			'<li class="p_link"><a href="/pages/put_money_on_account/?descr=41'+p_url+'">' + __l('Альфа-Клик') + '</a></li>'+
			'<li class="p_link"><a href="/pages/put_money_on_account/?descr=44'+p_url+'">' + __l('Карта «Кукуруза»') + '</a></li>'+
			'<li class="p_link"><a class="p_qiwi_link" href="/pages/put_money_on_account/?descr=57'+p_url+'">' + __l('«Спасибо» от <br/>Сбербанка»') + '</a></li>'+
			'</ul></div>');
		$('#sms-step-text').hide();
	};

	/*
	 *	HASH ADD AND CHANGE EVENT
	 */
	sms_box = new Array(), current_hash = '';
	set_step = function(step){
		sms_box['step'+step] = $('.anonym-sms-buy').html();
		// console.log(sms_box);
		window.location.hash = 'step'+step;
		current_hash = window.location.hash;
		// console.log('after hashchange: ' +  getAssocArrayLength(sms_box) + ' ' + window.location.hash);
	}

	$(window).bind('hashchange', function(e){
		// console.log('changed hash');
		// console.log(current_hash.substr(-1) + ' ' + window.location.hash.substr(-1));
		if (hash_frame && window.location.hash == '') {
			hash_frame = false;
			CloseReadFrame();
		}
		if (current_hash.substr(-1) > window.location.hash.substr(-1) || (current_hash.substr(-1) == 1 && current_hash.substr(-1) > window.location.hash.substr(-1))) {
			if (current_hash.substr(-1) == 1) {
				$("#buy_book_data").data("overlay").close();
				window.location.href = window.location.pathname+''+window.location.search;
				// console.log('redirect');
			} else {
				//console.log(window.location.hash.substr(1));
				$('.anonym-sms-buy').html(sms_box[window.location.hash.substr(1)]);
				// console.log('desc');
			}
			current_hash = window.location.hash;
		}
	});

	step_back = function(){
		history.go(-1);
		// $('.anonym-sms-buy').html(sms_box[window.location.hash.substr(1)]);
		return false;
	}
	/*
	 *	HASH ADD AND CHANGE EVENT END
	 */

	$('.anonym-sms-buy .buy_download_popup_text a,.anonym-webmoney-buy .buy_download_popup_text a').live('click', function(){
		$("#buy_book_data").slideUp(200,function(){
			$("#login-bubble").data("overlay").load();
		});
		return false;
	});

	$('.nosms-data #p_reg').live('click', function(){
		$("#buy_book_data").slideUp(200,function(){
			$("#login-bubble").data("overlay").load();
			$("#div-quick-login").hide();
			$("#div-quick-reg").show();
			$(".kykyru-footer-add-alt").addClass('ie7-fix-left-side');
		});
		return false;
	});

	// sms checker
	check_sms = function(type, oid) {
		var op = window.op || [];
		var Request = {
			url: '/pages/sms_check/',
			params: {order_id: oid, order_class: type, custom_set: op.length ? op[0]['custom_set'] : 0},
			HttpRType: 'json',
			OnData: function(Data){
				if (getCookie('last_autoread') && getCookie('last_autoread') == '') return;
				if (Data.status == 'ok'){
					setCookie('last_autoread','',1,'/');
					document.location = Data.url;
				} else if (Data.status == 'error'){
					if (Data.msg) alert(Data.msg);
					else if (Data.url) document.location = Data.url;
				} else {
					clearTimeout(check_sms_handler);
					check_sms_handler = setTimeout('check_sms('+type+', '+oid+')',5000);
				}
			},
			OnDataFail: function(fake1,fake2){}
		};
		GUJ.PutRequest(Request);
	};

	/* -------------------------- payment links, hidden iframe ----------------------------------------- */
	// if ($.browser.msie && $.browser.version > 7) {
		// anonym sms pop-up
		$('.pay_ments a:not(.p_other, .p_kykyru, .p_qiwi)').live('click', function(){
			var tmp_, temp = new Array(), tmp = $(this).attr('href').split("?");
			tmp = tmp[1].split("&");
			for (var i = 0; i < tmp.length; i++){ tmp_ = tmp[i].split("="); temp[tmp_[0]] = tmp_[1]; }
			if (temp['descr'] == 62) {
				return false;
			}
			var Request_tmp = {
				url: '/pages/proceed_payment/',
				params: {
					fsubmit: true,
					descr: temp['descr'],
					ref_url: temp['ref_url'],
					summ: temp['summ'],
					ajax: true
				}
			};
			Request_tmp.params.custom_set = temp['custom_set'] > 0 ? temp['custom_set'] : '';
			GUJ.PutRequest(Request_tmp);
			return false;
		});

		// added qiwi icon [23695]
		$('.pay_ments a.p_qiwi, .pay_ments a.p_qiwi_link').live('click', function(){
			if ($('#a_buybtn_qiwi').lenght) {
				$('#a_buybtn_qiwi').parent().submit();
				return false;
			} else
			  return true;
			//$('#a_buypay_qiwi').trigger('click');
			//return true;

		});

		var popup_onclick = 0;
		// anonym sms pop-up biblio_basket
		$('.payment-q a, .anonym-pay-buy .bg a, .book-icons-a a:not(#a_buybtn_paypal, #a_buybtn_qiwi, #a_buypay_webmoney), .book-icons-b a#a_buybtn_alfaclick').click(function(){
			// if ($(this).children('button').attr('id') == 'a_buypay_webmoney' && !popup_onclick) {
				// return WebMoney_OneClick();
			// }

			// [94452] ошибки верстки при клянчилке емейла (2 пункт)
			if (litres_user_id == 0 || my_account_email == '') {
				return true;
			}

			if ($(this).children('button').attr('id') == 'a_buypay_qiwi' || $(this).parent().attr('id') == 'pm_51' || $(this).attr('id') == 'ps-icon-51'
				|| $(this).attr('id') == 'pss-icon-42' || $(this).hasClass('a_buypay_paypal')
				|| $(this).parent().attr('id') == 'pm_62' || $(this).attr('id') == 'ps-icon-62'
				|| $(this).parent().attr('id') == 'pm_32' || $(this).attr('id') == 'ps-icon-32'
				|| $(this).parent().attr('id') == 'pm_99' || $(this).attr('id') == 'ps-icon-99'
				|| $(this).parent().attr('id') == 'pm_31'
				|| $(this).parent().attr('id') == 'pm_63' || $(this).attr('id') == 'ps-icon-63'
				|| $(this).parent().attr('id') == 'pm_61' || $(this).attr('id') == 'ps-icon-61') return true;

			var tmp_, temp = new Array(), tmp = $(this).attr('href').split("?");
			tmp = tmp[1].split("&");
			for (var i = 0; i < tmp.length; i++){ tmp_ = tmp[i].split("="); temp[tmp_[0]] = tmp_[1]; }
			if (temp['descr'] == 61 || temp['descr'] == 60 || temp['descr'] == 65 || temp['descr'] == 45 || temp['descr'] == 10 || temp['descr'] == 18 || temp['descr'] == 44 || temp['descr'] == 42 || temp['descr'] == 43 || temp['descr'] == 35 || temp['descr'] == 1 || temp['descr'] == 25 || (temp['descr'] == 50 && $('#pm_50').hasClass('abtest31082')) || temp['descr'] == 99 || temp['descr'] == 62 || temp['descr'] == 31)
				return true;
			var Request_tmp = {
				url: '/pages/proceed_payment/',
				params: {
					fsubmit: true,
					descr: temp['descr'],
					ref_url: temp['ref_url'],
					summ: temp['summ'],
					ajax: true
				}
			};
			Request_tmp.params.custom_set = temp['custom_set'] > 0 ? temp['custom_set'] : '';
			if ($(this).children('button').attr('id') == 'a_buypay_visa' && $('#payonline-iframe').length) {
				PayonlineShowIframe();
				Request_tmp.params.redir += '&potest=1';
			}
			GUJ.PutRequest(Request_tmp);
			return false;
		});

		$('.old-card button').click(function(){ return false; });

		// anonym sms pop-up biblio_book
		// added "new" icons under book buy button [23235]
		// added qiwi icon [23695]

		$('.anonym-pay-buy form button:not(#a_buypay_kukuruza, #a_buypay_sms, #a_buypay_paypal, #a_buypay_webmoney), .book-icons-a button:not(#a_buybtn_paypal, #a_buybtn_qiwi, #a_buybtn_webmoney), .book-icons-b button#a_buybtn_alfaclick').click(function(e){
			if (this.id == 'a_buypay_qiwi') {$('#a_buybtn_qiwi').parent().submit();return false;}
			//if (this.id == 'a_buypay_webmoney' && !popup_onclick) return WebMoney_OneClick();
			if ((this.id == 'a_buybtn_visa' || this.id == 'a_buybtn_mastercard') && $('#payonline-iframe').length) {
				//$('#a_buyany').trigger('click');
				a_buyany();
				setTimeout("$('#a_buypay_visa').trigger('click')", 300);
				e.preventDefault();
			}
			var _arts = $(this).parent('form').children('input[name=arts]').val() > 0 ? $(this).parent('form').children('input[name=arts]').val() : 0;
			var tmp = $(this).parent('form').children('input[name=redir]').val().split("?");
			var _redir = '/pages/proceed_payment/?'+tmp[1]+'&ajax=true' + '&fsubmit=true';
			var _title = $(this).parent('form').children('input[name=ord_title]').val();
			var _refurl = $(this).parent('form').children('input[name=ref_url]').val() || '';
			var Request_tmp = {
				url: '/pages/biblio_basket/',
				params: {
					action: 'create_custom_set',
					arts: _arts,
					redir: _redir,
					ord_title: _title,
					ref_url: _refurl
				}
			};

			if (this.id == 'a_buypay_visa' && $('#payonline-iframe').length) {
				PayonlineShowIframe();
				Request_tmp.params.redir += '&potest=1';
			}

			CSRF.sendRequest(Request_tmp);
			e.preventDefault();
		});

		// button click for users put_money_on_account
		payment_redir = function (desc, sum, ref, set, potest, dmrtest) {
			/* [116014] Верстка, интеграция с платежным шлюзом MAP */
			if (litres.isMAP && desc == 73) {
				payMAP();
				return false;
			}
			// console.log('clicked '+desc+' - '+sum+' - '+ref+' - '+set);
			if (desc == 65 || desc == 45 || desc == 10 || desc == 18 || desc == 44 || desc == 42 || desc == 43 || desc == 35 || desc == 1 || desc == 25 || desc == 99)
				return true;
	//		sum = $('#payment-form #ResultCell').text() < 10 ? 10 : $('#payment-form #ResultCell').text();
	// 		sum = sum < 10 ? 10 : sum;
	//		sum = parseInt($('#payment-form #GMCountCell').val()) < 10 ? 10 : parseInt($('#payment-form #GMCountCell').val());
			sum = parseFloat(sum) < 1 ? 1 : parseFloat(sum);
			set = set > 0 ? set : '';
	//		ref.length = ref > 0 ? ref : '';
			if(!popup_onclick && !FixPrice()) return;
			var Request_tmp = {
				url: '/pages/proceed_payment/',
				params: {
					fsubmit: true,
					descr: desc,
					ref_url: ref,
					summ: sum,
					custom_set: set,
					ajax: true
				}
			};
			if (desc == 63) {
				var _phone_number = $('#sberbank_phone').val();
				if (_phone_number == '') {
					alert(__l('Не введен номер телефона'));
					return false;
				} else if (ValidatePhone(_phone_number) != 1) {
					alert(__l('Указан неверный номер телефона'));
					return false;
				}
				Request_tmp.params.js = true;
				Request_tmp.params.phone_number = _phone_number.replace(/[\+\-\s]/g, '');
				delete Request_tmp.params.ajax;
				delete Request_tmp.params.fsubmit;
				Request_tmp.HttpRType = 'json';
				Request_tmp.OnData = function (Data) {
					if (Data == '' || Data.error) {
						alert(Data.error);
					} else {
						// alert(Data.id);
						$('#card-orderid').val(Data.id);
						$('.sberbank-waiter').show();
						$('#payment-form button[type="submit"]').hide();
						CheckMoneyUpdateStart();
					}
				}
			}
			if (potest) {
				Request_tmp.url += '?potest=1';
				PayonlineShowIframe();
			}
			if (desc == 64) {
				Request_tmp.params.js = true;
				delete Request_tmp.params.fsubmit;
				Request_tmp.HttpRType = 'json';
				Request_tmp.OnData = function (data) {
					if (data.error) {
						alert(data.error);
					}
					if (data.redirect) {
						window.location.href = data.redirect;
					}
				}
			}
			if (dmrtest) {
				Request_tmp.url += '?iframe=1';
				Request_tmp.OnData = function (data) {
					if (data.error) {
						alert(data.error);
					}
					if (data.redirect) {
						$('#dmrframe').on('load', function () {
							$('#dmr-iframe').addClass('dmr-loaded');
						});
						$('#dmrframe').attr('src', data.redirect);
					}
				}
				PayonlineShowIframe(false, false, false, false, 64);
			}
			/* [107798] Подключить прием кредиток через Paymentwall на en.litres.ru под параметром */
			if (litres.paymentwall) {
				Request_tmp.params.js = true;
				Request_tmp.HttpRType = 'json';
				Request_tmp.OnData = function (data) {
					if (data.id) {
						$('#card-order-id').val(data.id);
						$('#buy_book_data').removeClass('loading');
					}
				};
				Request_tmp.OnDataFail = function (data) {
                    console.log(data, 'OnDataFail');
                };
				paymentwallBrick();
			}
			GUJ.PutRequest(Request_tmp);
			return false;
		};

		// under anonym sms pop-up, new operators biblio_book [23235]
		// added qiwi icon [23695]
		$('.book-icons-b button:not(#a_buybtn_alfaclick), .book-icons-b a:not(#a_buybtn_alfaclick)').click(function(e){
			a_buyany();
			setTimeout(function(){
				a_buypay_sms();
				return false;
			}, 300);
			if ($(this).parent('form').length) {
				smspopState = $(this).parent('form').children('input[name=operator]').val();
			} else {
				smspopState = $(this).attr('href').split("&operator=")[1].substr(0, 2);
			}
			// console.log(smspopState);
			e.preventDefault();
		});


		/* added new webmoney [31151]  */

		$('#webmoney-link').live('click', function() {
			popup_onclick = 1;
			/* [50037] оплатить через стандартный интерфейс web-money */
			var webmoneyBtn = $('#a_buypay_webmoney'),
				parent = webmoneyBtn.parent(),
				custom_set = decodeURIComponent(parent.attr('href')).match(/[&?]custom_set=([^&#]*)/),
				ref = parent.attr('href') ? parent.attr('href') : parent.find('[name=redir]').val();
			  ref = decodeURIComponent(ref.match(/[&?]ref_url=([^&#]*)/)[1]);
			if (!!custom_set) {
			  payment_redir('50',document.getElementById('purchase_price').value,ref,custom_set[1]);
			} else {
			  var Request_tmp = {
				  url: '/pages/biblio_basket/',
				  Method: 'get',
				  HttpRType: 'json',
				  params: {
					  action: 'create_custom_set',
					  js: true
				  },
				  OnData: function (Data) {
					if (Data.custom_set) {
					  payment_redir('50',document.getElementById('purchase_price').value, ref, Data.custom_set.id);
					}
				}
			  };
			  if ($('#a_buybtn_webmoney').parent().find('input[name=arts]').length) {
				Request_tmp.params.arts = $('#a_buybtn_webmoney').parent().find('input[name=arts]').val();
			  } else {
				Request_tmp.params.basket = true;
			  }
			  CSRF.sendRequest(Request_tmp);
			}
			return false;
		});

		$('#a_buybtn_webmoney').click(function(e){
			a_buyany()
			setTimeout(function(){a_buypay_webmoney()}, 300);
			e.preventDefault();
		});
		// if ($('#payonline-iframe').length) {
			// $('#a_buybtn_visa,#a_buybtn_mastercard').live('click', function() {
				// $('#a_buyany').trigger('click');
				// setTimeout("$('#a_buypay_visa').trigger('click')", 300);
				// return false;
			// });
		// }

	// }

	/* -------------------------------------- new bookpage cover ------------------------------------- */

	$('.recenses-count a').click(function(){
		$('html, body').stop().animate({ scrollTop: $('#recenses').offset().top}, 800);
	});

	$('#toggle-audio-list a').click(function(){
		var t1 = $(this).find('.showPlaylist'), t2=$(this).find('.hidePlaylist');

		if(t2.css('display')=='inline'){
			t2.hide();
			t1.show();
			$('#audio-list-roll').fadeOut(400);
		}else{
			t1.hide();
			t2.show();
			$('#audio-list-roll').fadeIn(400);
		}

	});

	$('#blockcenter #info .rowinfo a.dot').click(function(){
		var obj = $(this).attr('id')
		$(this).removeClass('clicked');
		$(this).addClass('clicked');
		$('#hg-pop_close').show();
		$('#hg-content').html('<div id="readers-pop"> '+$(this).parent().find('.to_show').html()+' </div>');
		$('#hg-pop-tooltip').css({left: $(this).parent().offset().left, top: $(this).offset().top+$(this).height()}).show();
	});

	$('.other_pub .book').find('.item:gt(5)').hide();
	$('.other_pub-sp a').click(function(){
		$(this).parent().hide();
		$(this).closest('.book').find('.item:gt(5)').show();
	});

	$("#filter-types a").click(function(){
		var attr=$(this).attr('id');
		$("#filter-types li").removeClass('highlight');
		$(this).parent().addClass('highlight');
		if(attr=='allf'){
			$('.inside_block').show();
		}else{
			$('.inside_block').hide();
			$('.'+attr).closest('.inside_block').show();
		}
	});

	$('#payment_mobile').on('submit', function () {
		var phoneNum = $(this).find('input[name="phone_number"]').val();
		if (phoneNum == '') {
			alert(__l('Не введен номер телефона'));
			return false;
		} else if (ValidatePhone(phoneNum) != 1) {
			alert(__l('Указан неверный номер телефона'));
			return false;
		}
	})
}});

function PayonlineShowIframe(arts, title, price, other_method, descr) {
	var descr = descr || 32;
	var obj_class = descr == 64 ? 'dmr-iframe' : 'payonline-iframe';
	if (descr == 64) {
		$('#dmr-iframe').removeClass('dmr-loaded');
	}
	if (arts) {
		CSRF.sendRequest({
			url: '/pages/biblio_basket/',
			params: {
				action: 'create_custom_set',
				arts: arts,
				redir: '/pages/proceed_payment/?summ='+price+'&descr=32&ajax=true&potest=1' + '&fsubmit=true',
				ord_title: title,
				ref_url: '/pages/my_books_fresh/'
			}
		});
		if (other_method) {
			if (!$("#buy_book_data #other_method").length)
				$("#buy_book_data").append('<a id="other_method">' + __l('Оплатить другим способом') + '</a>');
			$('#other_method').attr('href', other_method);
		}
	}

	if ($("#buy_book_data").length) {
		$("#buy_book_data").data('overlay').load();
		$('#buy_book_data .close, #exposeMask').addClass('potest_close')
			.live('click', function(){
				$(this).removeClass('potest_close');
				$('#' + obj_class).css({'display':'none'});
				$('.anonym-pay-buy').css('display', 'block');
				$('#buy_book_data').css({'width':'517px'});
				$('#' + obj_class + ' iframe').attr('src','about:blank');
			});
		$('#' + obj_class).css('display', 'block');
		$('.anonym-pay-buy').css('display', 'none');
		$('#buy_book_data').animate({'width':'614px'});
	} else if ($('#blockcenter').length) {
		$('#a_buybtn_visa,#a_buybtn_mastercard').live('click', function() {
			$('#a_buyany').trigger('click');
			setTimeout("$('#a_buypay_visa').trigger('click')", 300);
			return false;
		});
		$('.anonym-pay-buy').css('display', 'none');
		$('#' + obj_class).css('display', 'block');
		window.parent.document.getElementById('LitresPopup').style.height = '700px';
		window.parent.document.getElementById('LitresPopup').style.width = '635px';
	}
}

	// webmoney one-click popup [31151]
	function WebMoney_OneClick() {
		$('.anonym-pay-buy').slideUp(200, function(){
			$(this).after('<div class="anonym-webmoney-buy"><div class="buy_download_popup_text">'+$('.buy_download_popup_text').html()+'</div></div>');
			$('.anonym-webmoney-buy .buy_download_popup_text p').html(__l('Если вы уже регистрировались или покупали книги на нашем сайте,<br />воспользуйтесь <a href="/pages/login/">входом в систему</a> для пополнения своего счета.'));
			$('.anonym-webmoney-buy .buy_download_popup_text strong').html(__l('Оплата через систему WebMoney'));
			$('.anonym-webmoney-buy').append('<p id="sms-step-text">' + __l('Оплатить быстрым платежом с помощью SMS по номеру мобильного телефона, привязанному к wmid:') + '</p>'+
				'<div class="gray-corners corners"><div class="webmoney_data_status">'+
				// 1 часть мэйл или wmid
				'<div id="webmoney-step-1"><h3>' + __l('Укажите номер телефона или e-mail') + '</h3>'+
				'<div><span class="ext-input-wrap"><input class="ext-input" name="webmoney-client" id="webmoney-client"/></span>'+
				'<button class="coolbtn btn-green-18" type="submit" onclick="WebMoney_OneClick_StepOne();"><u></u>' + __l('Продолжить') + '<s></s></button></div>'+
				'<div class="op-data"><p>' + __l('На ваш телефон будет отправлено SMS с числовым кодом подтверждения. У wmid, с которого производится платеж, должна быть подключена <a href="{link}">опция оплаты с помощью SMS</a>, сделать это можно на сайте Сервиса безопасности.', {link: 'https://wiki.webmoney.ru/projects/webmoney/wiki/%D0%9F%D0%BE%D0%B4%D0%BA%D0%BB%D1%8E%D1%87%D0%B5%D0%BD%D0%B8%D0%B5_%D0%BE%D0%BF%D1%86%D0%B8%D0%B8_%D0%BE%D0%BF%D0%BB%D0%B0%D1%82%D1%8B_%D1%81_%D0%BF%D0%BE%D0%BC%D0%BE%D1%89%D1%8C%D1%8E_SMS'}) + '</p></div></div>'+
				//2 часть code
				'<div id="webmoney-step-2" style="display:none;"><input id="card-orderid" type="hidden"><h3>' + __l('Ввведите числовой код из SMS') + '</h3>'+
				'<div class="multiple-blocks"><span class="ext-input-wrap"><input class="ext-input inum" name="webmoney-code" id="webmoney-code"/></span>'+
				'<button class="coolbtn btn-green-18" type="submit" onclick="WebMoney_OneClick_StepTwo();"><u></u>' + __l('Завершить платеж') + '<s></s></button></div>'+
				'<div class="op-data"><p>' + __l('Взимается дополнительная фиксированная комиссия в размере 0,9 WMR, 0,04 WMZ, 0,03 WME, 0,25 WMU, в зависимости от валюты платежа.') + '</p></div></div>'+
				//end 2 часть
				//popup
				'<div id="card-progress" style="display:none"><p>' + __l('Идет обработка платежа') + '</p></div>'+
				// end
				'</div></div>'+
				'<div class="webmoney-link"><a href="javascript:void(0);" id="webmoney-link">' + __l('Оплатить через стандартный интерфейс WebMoney') + '</a></div>'
				//'<a href="/pomosch/sposobi-oplati/" target="_top" class="icon_oplat_popup"></a>'
				);
			$('.anonym-webmoney-buy').slideDown(200);
		});
		return false;
	}

	$('#webmoney-step-1 #webmoney-client').live('keypress',function (e) {
		if (e.keyCode  == 13) {
			$('#webmoney-step-1 button').trigger('click');
			return false;
		}
	});
	$('#webmoney-step-2 #webmoney-code').live('keypress',function (e) {
		if (e.keyCode  == 13) {
			$('#webmoney-step-2 button').trigger('click');
			return false;
		}
	});

	function WebMoney_OneClick_StepOne() {
		var form_err = '';
		var cardnum = $('#webmoney-client').val();
		if(!cardnum.length) {
			form_err += __l("- Не введен телефон или e-mail карты\n");
			MarkRegField(__el('webmoney-client'));
			$('#webmoney-client').focus();
		} else {
			UnMarkRegField(__el('webmoney-client'));
		}
		if(form_err!='') {
			alert(form_err);
			return false;
		}

		WebMoney_OneClick_Overlay_Show();

		var sum = $('#purchase_price').attr('value');

		GUJ.PutRequest({
			url: '/pages/webmoney_payment_init/',
			Method: 'POST',
			params: {
				'sum':sum,
				'client':cardnum
			},
			OnData:function(data){
				if(data.result!="ok") {
					WebMoney_OneClick_Overlay_Close(1);
					alert(data.message);
					return false;
				}
				$('#card-orderid').val(data.oid);
				//WebMoney_OneClick_Overlay_Close(2);
				wm_ref_url = '/pages/my_books_fresh/?action=create_custom_set&arts='+$('#a_buybtn_webmoney').parent().find('input[name=arts]').val()+'&buy_now=1';
				WebMoney_OneClick_AutoCheck_Start();
			}

		});

	}

	function WebMoney_OneClick_AutoCheck_Start() {
		WMIntervalID = setInterval("WebMoney_OneClick_AutoCheck()", 5000);
	}

	function WebMoney_OneClick_AutoCheck_Stop() {
		clearInterval(WMIntervalID);
	}

	function WebMoney_OneClick_AutoCheck() {
		var request = {
			url: '/pages/webmoney_payment_check/',
			Method: 'POST',
			OnData:function(data) {
				if(data.result=="ok") {
					$('#webmoney-code').focus();
					WebMoney_OneClick_Overlay_Close(2);
					WebMoney_OneClick_AutoCheck_Stop();
				} else if (data.result=="error") {
					WebMoney_OneClick_Overlay_Close(1);
					alert(data.message);
					WebMoney_OneClick_AutoCheck_Stop();
					return false;
				} else if ($('#card-progress p').text()!=data.message) {
					$('#card-progress p').html(data.message);
				}
			}
		}
		request.params = {
			'order':$('#card-orderid').val()
		}
		GUJ.PutRequest(request);
		return false;
	}

	function WebMoney_OneClick_StepTwo() {
		if(!$('#webmoney-code').val().length) {
			alert(__l("- Не введен код подтверждения\n"));
			MarkRegField(__el('webmoney-code'));
			$('#webmoney-code').focus();
			return false;
    } else {
			UnMarkRegField(__el('webmoney-code'));
		}
		WebMoney_OneClick_Overlay_Show();
				GUJ.PutRequest({url: '/pages/webmoney_payment_check/', Method: 'POST',
		params: {
			'order':$('#card-orderid').val(),
			'code':$('#webmoney-code').val()
		},OnData:function(data){
			if(data.result=="ok") {
				CheckMoneyStart();
			} else if (data.result=="error") {
				$('.anonym-webmoney-buy').slideDown(200);
				alert(data.message);
				return false;
			}
			// $('.anonym-webmoney-buy').slideDown(200);
			// alert("Пополнение счета успешно завершено.");
			// document.location = '/pages/my_account/';
		}});

		return false;
	}

	function WebMoney_OneClick_Overlay_Show() {
		$('#webmoney-step-1').hide();
		$('#webmoney-step-2').hide();
		$('#card-progress').show();
	}

	function WebMoney_OneClick_Overlay_Close(step) {
		$('#webmoney-step-'+step).show();
		$('#card-progress').hide();
	}

	/* Проверка на пополнение счета, когда деньги поступают на счет юзера */
	function CheckMoneyStart() {
		CheckMoneyIntID = setInterval("CheckMoney()", 5000);
	}
	function CheckMoneyStop() {
		clearInterval(CheckMoneyIntID);
		//$('.anonym-webmoney-buy').slideDown(200);
	}
	function CheckMoney() {
		var request = {
			url: '/pages/sms_check/',
			Method: 'POST',
			HttpRType: 'json',
			OnData:function(data) {
				if (getCookie('last_autoread') && getCookie('last_autoread') == '') return;
				if(data.status=="ok") {
					CheckMoneyStop();
					setCookie('last_autoread','',1,'/');
					document.location = wm_ref_url;
					//alert("Пополнение счета успешно завершено.");
				} else if (data.status=="error") {
					CheckMoneyStop();
					WebMoney_OneClick_Overlay_Close(2);
					if (data.msg) alert(data.msg);
					//else if (wm_ref_url) document.location = wm_ref_url;
				}
			}
		}
		request.params = {
			'order_id':$('#card-orderid').val()
		}
		GUJ.PutRequest(request);
		return false;
	}


var ContactOK = undefined;
var FBOk = undefined;
function popup_social(){

	var container = '#soc_group';
	if ($(container).html()) return true;

	var node = '#download_file_popup';

	$(node).overlay({
		fixed:false,
		// effect: 'apple',
		speed:100,
		load: false,
		onClose: function() {
			$.mask.close();
			CSRF.sendRequest({
				url: '/pages/ajax_epmty/',
				params: { action:'set_socnet_reminder', rand:Math.random() }
			});
		},
		onLoad:function() {
			$(document).mask({
				color: '#000',
				loadSpeed: 200,
				opacity: 0.7,
				onBeforeClose: function() {
					$(node).overlay().close();
				}
			});
		}
	});

	function CkeckAllDoneAndGo(){
		if (FBOk == undefined || ContactOK == undefined) return false;
		if(FBOk == 0 && ContactOK != 1){
				$(node).overlay().load();
				$(container).html('<noindex><iframe src="//www.facebook.com/plugins/likebox.php?href=http%3A%2F%2Fwww.facebook.com%2Fmylitres&amp;width=518&amp;colorscheme=light&amp;show_faces=true&amp;border_color&amp;stream=false&amp;header=true&amp;height=290" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:518px; height:290px;" allowTransparency="true"></iframe></noindex>');
			}else if(FBOk != 1 && ContactOK == 0){
				$(node).overlay().load();
				$(container).html('<div id="vk_groups2"></div>');
				VK.Widgets.Group("vk_groups2", {mode: 0, width: "518", height: "290"}, 23482323);
			}
	}
	CheckSNGroups(CkeckAllDoneAndGo);
	return true;
}

function CheckSNGroups(f) {
	if(getCookie('ingroup_vk')) {
		ContactOK=getCookie('ingroup_vk');
		if(typeof f=='function') f();
	} else {
		// Тупой ВКонтакт не умеет сам правильно определять авторизован ли пользователь
		// будем через try
		try {
			VK.api('groups.isMember',{gid: 23482323, v: 5.73},function(k) {
				if (k == undefined){
					ContactOK = -1;
				} else {
					ContactOK = k.response == undefined ? -1 : k.response;
					setCookie('ingroup_vk',ContactOK,0,'/',2);
				}
				if(typeof f=='function') f();
			});
		} catch(e) {
			ContactOK = -1;
			if(typeof f=='function') f();
		}
	}
	if(getCookie('ingroup_fb')) {
		FBOk=getCookie('ingroup_fb');
		if(typeof f=='function') f();
	} else {
		if (FB.getAuthResponse() != null){
		FB.api({method: 'pages.isFan', page_id: 'mylitres'},function(k){
			FBOk = k == undefined ? -1 : k == 1 ? 1 : 0;
			FBOk_out=k.error_code;
			if(FBOk_out==104) FBOk=-1;
			setCookie('ingroup_fb',FBOk,0,'/',2);
			if(typeof f=='function') f();
		});
		} else {
			FBOk=-1;
			if(typeof f=='function') f();
		}
	}
}

jQuery.fn.placeholder = function() {
	$(this)
	.focusout(function() {
		if (this.value == '') this.value = $(this).attr('placeholder');
		if (this.value == $(this).attr('placeholder'))
			$(this).addClass('def_txt');
		else $(this).removeClass('def_txt');
	})
	.focus(function(event) {
		event.stopImmediatePropagation();
		if (this.value == $(this).attr('placeholder')) {
			$(this).val('').removeClass('def_txt');
		}
	})
	.mousedown(function() {
		$(this).focus();
	})
	.triggerHandler('focusout');
}

function NewOpenPassToggle(prefix) {
	var passopen=$('#show_pass'+prefix).is(':checked');
	var opwf=$('#open_pwd'+prefix+'_inp');
	var cpwf=$('#pwd'+prefix+'_inp');
	var cpwp=$('#pwd2'+prefix+'_inp');
	if(passopen) {
		//opwf.val(cpwf.val());
		opwf.val(cpwf.val()); /* add password fix ShowPass */
		opwf.triggerHandler('focusout');
	} else {
		var value = (!placeholders_supported && opwf.val()==opwf.attr('placeholder'))?'':opwf.val();
		//cpwf.val(value);
		cpwf.val(opwf.val());
		cpwp.val(opwf.val());

	}
	$('#open_pwd'+prefix).css('display',passopen?'block':'none');
	$('#pwd'+prefix).css('display',passopen?'none':'block');
}

var bubbleInterval;
var bubbleTimeout;
var bubbleIndex = null;

$(document).ready(function() {
	/* top menu */

	$('#hg-overlay, #hg-pop_close').click(function(){
		$("#hg-pop-tooltip").hide();
		$('.dwnl_splr_btn_active').removeClass('dwnl_splr_btn_active');
		$('#hg-pop-tooltip').removeClass('free_book_get');
		$('#hg-overlay').hide();
		$('#hg-content:not(.langs)').html(' ');
		$('#hg-t, #hg-t > i, #hg-t > i > b').removeAttr("style");

		/* 22715 */
		if ($('.new-book-over-cover .download-links .formats a').length > 0)
			$('.new-book-over-cover .download-links .formats a').removeClass('clicked')
	});

    $('#multi_card_calc').on('keyup', '.quantity', function(){
        var quantity = +$(this).val();
        var total = $('#total');
				if(quantity<100){
					total.text(0);
				} else if(quantity>=100 && quantity<=299){
					total.text(Math.floor(quantity * 0.25));
				} else if(quantity>=300 && quantity<=499){
					total.text(Math.floor(quantity * 0.30));
				} else if(quantity>=500 && quantity<=699){
					total.text(Math.floor(quantity * 0.35));
				} else if(quantity>=700 && quantity<=999){
					total.text(Math.floor(quantity * 0.40));
				} else {
					total.text(Math.floor(quantity * 0.50));
				}
    });

		var book_author_list = $('.book-author .h2');
		if (book_author_list.length && book_author_list.height() > 65) {
				book_author_list.delay(500).addClass('book-author-closed').after('<div class="transp_footer"><span>' + __l('Показать всех авторов') + '</span></div>');
				$('.transp_footer').on('click', function () {
						var t = $(this);
						if (t.prev().height() > 65) {
								t.prev().addClass('book-author-closed').next().removeClass('t_on').find('span').text(__l('Показать всех авторов'));
						} else {
								t.prev().removeClass('book-author-closed').next().addClass('t_on').find('span').text(__l('Свернуть авторов'));
						}
				});
		}
});

function getAssocArrayLength(tempArray) { // функция возращает размер массива...
	var result = 0;
	for (tempValue in tempArray) result++;
	return result;
}

/* popup скачать для миникарточки */
function popup_download_type(obj,art,fid,filename,sid,formats,z_index,url_path){
	//$('.dwnl_splr_btn').removeAttr("href"); fix

	if (!formats.length) {
		return true;
	}

	// названия длы вывода
	var format_names = {"fb2.zip":"FB2", "epub":"EPUB", "ios.epub":"IOS.EPUB", "txt.zip":"TXT.ZIP", "rtf.zip":"RTF", "a4.pdf":"PDF A4", "html.zip":"HTML.ZIP", "a6.pdf":"PDF A6",
		"mobi.prc":"MOBI", "txt":"TXT", "java":"JAVA", "lrf":"LRF"};
	var format_subnames = {"mobi.prc":" (Kindle)", "lrf":" (Sony)"};
	var tmp = ""; // пустая переменая в которую генерится весь контент поп-апа
	var drm;
	var arr = {1:[], 2:[], 3:[], 4:[], 5:[]}; // пустой многомерный массив
	for (var i = 0; i < formats.length; i++) { // группируем
		if (formats[i] == 'fb2.zip' || formats[i] == 'epub' || (!url_path && formats[i] == 'ios.epub'))
			arr[1][arr[1].length] = formats[i];
		if (formats[i] == 'a6.pdf' || (!url_path && formats[i] == 'mobi.prc'))
			arr[2][arr[2].length] = formats[i];
		if (!url_path && formats[i] == 'lrf')
			arr[3][arr[3].length] = formats[i];
		if (formats[i] == 'txt.zip' || formats[i] == 'rtf.zip' || formats[i] == 'a4.pdf' ||
			(!url_path && formats[i] == 'html.zip'))
				arr[4][arr[4].length] = formats[i];
		if (!url_path && formats[i] == 'txt') {
			arr[5][arr[5].length] = formats[i];
			arr[5][arr[5].length] = 'java';
		}
		if(formats[i] == 'drm'){
			drm = 1;
		}
	}
	for (var i = 1; i <= getAssocArrayLength(arr); i++) { // делаем списки
		if (getAssocArrayLength(arr[i]) > 0) {
			tmp2 = arr[i];
			if (i == 1) tmp += '<ul class="pdt1"><li class="title">' + __l('Удобные') + '</li>';
			if (i == 2) tmp += '<ul class="pdt2"><li class="title">' + __l('Для ридеров') + '</li>';
			if (i == 3) tmp += '<ul class="pdt3"><li class="title">' + __l('Другие') + '</li>';
			if (i == 4) tmp += '<ul class="pdt4"><li class="title">' + __l('Для компьютера') + '</li>';
			if (i == 5) tmp += '<ul class="pdt5"><li class="title">' + __l('Для телефона') + '</li>';
			for (var g = 0; g < tmp2.length; g++) {
				if ( tmp2[g] == 'java' ) {
					tmp += '<li><a href="/pages/make_java/?file='+fid+'">'+format_names[tmp2[g]]+'</a>';
				} else {
					tmp += '<li><a href="';
					if (url_path) {
						tmp += url_path;
					} else {
						tmp += '/download_book/'+art+'/'+fid+'/'+filename;
					}
					if (tmp2[g] == 'fb2.zip') {
						tmp += '.new';
					}
					tmp += '.' + tmp2[g]+'?sid='+sid;
					if (url_path) {
						tmp += '&from=litres_frag';
					}
					tmp += '&track=from_mybook_header__mainpopup">' +
						format_names[tmp2[g]]+'</a>' +
						(format_subnames[tmp2[g]]?format_subnames[tmp2[g]]:"");
				}
				if(drm){
					tmp +='<span style="color:#dd3d0e;"> ' + __l('(защищено DRM)') + '</span>';
				}
				tmp +='</li>';
			}
			tmp += '</ul>';
		}
	}
	$("#hg-content").html('<div class="pdt-content">'+tmp+'</div>');
	HGContentPos(obj);
	if (z_index) $('.hint-gray,#hg-overlay').css({'z-index':9999});
	else {$('.hint-gray').css({'z-index':1010});$('#hg-overlay').css({'z-index':11});}
	$('.dwnl_splr_btn').removeClass('dwnl_splr_btn_active');
	$(obj).addClass('dwnl_splr_btn_active');
}

function HGContentPos(obj) {
	var offleft=$(obj).offset().left,
		ttip=$("#hg-pop-tooltip"),
		ttip_width = ttip.width(),
		body=$("body").width(),
		pd = offleft + ttip_width;
	//alert(tt+'_'+body+'_'+(body-offleft));
	$('#hg-pop-tooltip, #hg-pop_close, #hg-overlay').show();
	if(pd >= body)
		ttip.css({left:body-ttip_width-30, top:$(obj).offset().top+20});
	else {
		ttip.css({left:offleft-30, top:$(obj).offset().top+20});
	}
	var left_width = $(obj).offset().left - ttip.offset().left + $(obj).width()/2 + 16;
	ttip.find("#hg-t").css({marginLeft: left_width, width: ttip_width-left_width});
	ttip.find("#hg-t i").css({width:left_width, left:-left_width});
	ttip.find("#hg-t b").css({width:left_width - 44}); // 12 = margin-left, 32 = width of arrow
}

function setBubbleCloseTO() {
	bubbleTimeout = setTimeout(function(){
		clearTimeout(bubbleTimeout);
		if(bubbleIndex!=null) {
			$("#top_bubble_area .top_bubble .top_bubble_close").eq(bubbleIndex).click();
		}
	},3000);
}

function LoginFormCheck(the_form) {
	if (the_form && the_form.id == 'frm_login') {
		AppendUtcOffsetInput2Form('frm_login');
		return true;
	} else {
		// [ticket:36452] Fix for 404 error on pages with GET params (example: pages/biblio_collection/?collection=3731)
		var pageUrl     = window.location.href;
		var paramsMatch = pageUrl.match(/([^?]+)\?(.+)/);
		if (paramsMatch != null) {
			pageUrl        = paramsMatch[1];
			var getParams  = paramsMatch[2].split('&');
			$(getParams).each(function(idx, val) {
				var params           = val.split('=');
				var decodedParamName = decodeURI(params[0]);
				var decodedParamVal  = decodeURI(params[1]);

				if (decodedParamVal.length && !$('#frm_quick_login input[name='+ decodedParamName +']').length)
					$('#frm_quick_login').append('<input type="hidden" name="'+ decodedParamName +'" value="'+ decodedParamVal +'" />');
			});
		}
		document.forms.frm_quick_login.action = pageUrl;

		AppendUtcOffsetInput2Form('frm_quick_login');
	};

	if($('#login_fast_inp').val()=='' || (!placeholders_supported && $('#login_fast_inp').val()==$('#login_fast_inp').attr('placeholder'))) {
		$('#login_fast_inp').removeClass('def_txt').focus();
		return false;
	}
	var el=$('#'+($('#show_pass_fast').is(":checked")?'open_':'')+'pwd_fast input');
	if(el.val()=='' || (!placeholders_supported && el.val()==el.attr('placeholder') )) {
		el.removeClass('def_txt').focus();
		return false;
	}
	return true;
}

function PutMoneyBasketAddArt(Obj,Summ){
	var CMess = __l('На вашем счете недостаточно средств для покупки, не хватает {summ} <span class="litres_ruble">{rub}</span>\nХотите отложить книгу и пополнить счет сейчас?', {summ: RubPrice(Summ), rub: '&#8381;'});
	var CFunc = function exec() {
		if(Summ<10) Summ=10;
		window.location.href='/pages/put_money_on_account/?summ='+RubPrice(Summ)+'&ref_url='+encodeURIComponent(Obj.getAttribute('href'));
	};
	alertBox.errorStickerButtons[0].value='OK';
	alertBox.alert(CMess,CFunc);
	return false;
}

var AJAXOFF = 0;
var RootStarted = 0;
function PutArtToBasketAjax(ArtID,AddPrice,Type,Delivered){
	// [33318] third_book_free
	if (AJAXOFF || RootStarted || ((Type===0||Type===4||Type===1) && typeof third_book_free != 'undefined' && third_book_free > 0)){
		return true;
	}

	var Mode = 'root';
	RootStarted = 1;
	if ($('#fast_basket_spl').length > 0){
		Mode = 'child';
		RootStarted = 0;
	} else if ($('#right_col_private').length > 0){
		Mode = 'semiroot';
	}
	var ToBasAjaxRequest = {
		url: '/pages/ajax_tobasket/',
		params : {art: ArtID, mode: Mode, action: 'add_art_to_basket'},
		Method: 'post',
		OnHTML:function(HTML){
			var TargetElement = $('#fast_basket_spl');
			if (this.params.mode == 'semiroot'){
				TargetElement = $('#right_col_private');
			} else if (this.params.mode == 'root'){
				TargetElement = $('#right_content_cell');
			}
			TargetElement.prepend(HTML);
			var ElToSlide = 0;
			if (this.params.mode == 'root'){
				ElToSlide = 'right_col_private';
			} else if (this.params.mode == 'semiroot'){
				ElToSlide = 'fast_basket_block';
			}
			// если товар добавлен в корзину - правый блок
			if (ElToSlide){
				$('#'+ElToSlide).hide();
				// $('#fast_basket_spl .price').html($('.book_descr_links .td').html());
				// $('#fast_basket_spl .price div').children('.discount').remove();
				$('#'+ElToSlide).slideDown('fast').addClass('gray-corners').addClass('corners');
				if($('#last_views').length > 0) {
					$('#last_views').before("<hr class='right_col_hr'/>");
				}
			}
			var basket_items=$('div[id^="basketitem_"]').length;
			$('#fast_basket_spl_title_num').html('('+basket_items+')');
			$('.header_basket_spl_title_num').html(__ln('{count} товар', '{count} товаров', basket_items, {count: basket_items}));
			if (this.params.mode == 'child'){
				$('#total_qbasket_summ').html(RubPrice(DerubPrice('total_qbasket_summ') + this.AddPrice));
			}
			MailTarAddCart();
			$('*[class~="tobasket_'+this.ArtID+'_out"]').show();
			$('*[class^="tobasket1_'+this.ArtID+'"]').remove();
			if ($('*[class~="in_basket_quality_'+this.ArtID+'"]').length) { // for paper book
				Paper_Book_Basket(this.ArtID,1);
			}
			RootStarted = 0;
			if (Delivered==1) ToBasElems.show();
			if ((Type===0||Type===4||Type===1) && typeof third_book_free!= 'undefined') third_book_free++; // [33318] third_book_free
		},
		OnHTMLFail: function(fake1,fake2){
			AJAXOFF = 1;
			if(fake2.AnonErrMsg) {
				alert(fake2.AnonErrMsg);
			} else {
				alert(__l('Ошибка при добавлении книги в корзину. Попробуйте, пожалуйста, добавить эту книгу в корзину еще раз'));
			}
			$('*[class~="tobasket1_'+this.ArtID+'"]').remove();
			this.ToBasElems().show();
		},
		ArtID: ArtID,
		AddPrice: AddPrice,
		ToBasElems: function(){return $('*[class~="tobasket_'+this.ArtID+'_in"]')}
	};

	var ToBasElems = ToBasAjaxRequest.ToBasElems();
	ToBasElems.before('<img alt="" src="/static/new/i/ajax_progress.gif" class="tobasket1_'+ArtID+' progress_gif" width="16" height="16" style="position: relative;"/>');
	ToBasElems.hide();
	CSRF.sendRequest(ToBasAjaxRequest);
	try { event.returnValue = false } catch(e) { return false };
}

function DropArtFromBasketAjax(BasketID,PriceToDecr,ArtID,Type){
	// [33318] third_book_free
	if (AJAXOFF ||  ((Type===0||Type===4||Type===1) && typeof third_book_free != 'undefined')){
		return true;
	}
	var Request = {
		url: '/pages/ajax_empty2/',
		Method: 'post',
		params : {action: 'del_art_from_basket', itm: BasketID},
		BasketID: BasketID,
		PriceToDecr: PriceToDecr,
		OnData: function(Data){
			if (Data === 'ok'){
				var basket_items = $('div[id^="basketitem_"]').length - 1;
				$('#fast_basket_spl_title_num').html('('+basket_items+')');
				$('.header_basket_spl_title_num').html(__ln('{count} товар', '{count} товаров', basket_items, {count: basket_items}));
				$('#total_qbasket_summ').html(RubPrice(DerubPrice('total_qbasket_summ') - this.PriceToDecr));
				$('#basketitem_'+this.BasketID).slideUp('fast',function(){
					$(this).remove();
					if ($('div[id^="basketitem_"]').length == 0){
						$('#fast_basket_block').remove();
						if($('#right_col_hr_divider').length == 0) $('.right_col_hr').remove();

						if ($('#right_col_hr_divider').length == 0 && $('#last_views').length == 0){
							$('#right_col_private').remove();
						}
						else {
							$('#right_col_hr_divider').remove();
						}
					} else if ($('#fast_basket_hided_link_d').length > 0 && $('div[id^="basketitem_"]').length - $('#fast_basket_hided div[id^="basketitem_"]').length < 3){
						OpenFastBasketSpoiler();
						$('#fast_basket_hided_link_d').remove();
					}
				});
				$('*[class~="tobasket_'+this.ArtID+'_in"]').show();
				$('*[class~="tobasket_'+this.ArtID+'_out"]').hide();
				if ($('*[class~="in_basket_quality_'+this.ArtID+'"]').length) { // for paper book
					Paper_Book_Basket(this.ArtID);
				}
			} else {
				this.OnDataFail(0,0);
			}
		},
		ArtID: ArtID,
		OnDataFail: function(fake1,fake2){
			AJAXOFF = 1;
			alert(__l('При удалении из корзины произошла ошибка. Попробуйте, пожалуйста, удалить товар из корзины еще раз'));
			$('#frombasket_'+this.BasketID).remove();
		}
	}
	$('#basketitem_'+BasketID+' .del_item_btn').prepend('<span class="progress"><img alt="" src="/static/new/i/ajax_progress.gif" id="frombasket_'+BasketID+'" class="frombasket_'+BasketID+' rm_progress_gif" width="16" height="16"/></span>');
	CSRF.sendRequest(Request);
	try { event.returnValue = false } catch(e) { return false };
}

function DerubPrice(ElementID){
	var CurRubPrice = $('#'+ElementID).text();
	CurRubPrice = CurRubPrice.replace(',','.') * 1;
	return CurRubPrice;
}

/* [70581] mail.ru при добавлении в корзину товара */
function MailTarAddCart(){
	var _tmr = window._tmr || (window._tmr = []);
	_tmr.push({ id: "1283707", type: "reachGoal", goal: "cart" });
}

// Хакообразная подгонка правого столбца по высоте к высоте основной страницы
var mhnns_cnt = 0;
var WorkingWidth = 0;
var WorkingWidth = 0;
var FixWidthOn = 1600;
function MakeHotNewNormalSize(){
  if (mhnns_cnt > 0){
    mhnns_cnt = 2;
    return;
  }
  mhnns_TID = 1;

	if (document.getElementById('main-div')) MainDivResize(false);
	if (document.getElementById('master_page_div')){
		AdoptInScreenBlocks();
		var HotNewDiv = document.getElementById('ratings');
		if (!HotNewDiv){
			return;
		}
		var HeightLimit = document.getElementById('master_page_div').offsetHeight;
		if (HeightLimit < 700) HeightLimit = 700;

		var CropElementTo = FindFinalElement(HotNewDiv,HeightLimit - HotNewDiv.offsetTop);
		HotNewDiv.style.overflow='hidden';
		HotNewDiv.style.height = (CropElementTo + 3)+'px';
	}
	if (mhnns_cnt > 1) {
		mhnns_cnt = 0;
		MakeHotNewNormalSize();
	}
  mhnns_TID = 0;
}

function FindFinalElement(TopDiv,Limit){
  var CurPos = 0;
  for (var i=0;i < TopDiv.childNodes.length && CurPos < Limit;i++){
    var Child = TopDiv.childNodes[i];
    var ChildClass = Child.className+'';
    if (ChildClass.match(/right_col_title|extender/)){
      CurPos = Child.offsetTop;
    } else {
      CurPos = FindFinalElement(Child,Limit - CurPos);
    }
  }
  return CurPos;
}



var Padding = 20;
var BlockWidth = 0;
var TitleWidth = 0;
var BlockCSS;
var TitleCSS1;
var TitleCSS2;
var MainDivCSS;

function AdoptInScreenBlocks(){
  if (no_adopt) return;
  if (BlockWidth){
    WorkingWidth = 0;
    if (document.getElementById('master_page_div')){
      // Документ уже загружен, можно фактический размер поля смотреть
      WorkingWidth = document.getElementById('master_page_div').offsetWidth;
    } else {
			var gpad = GetPadding();
			WorkingWidth = Math.min(document.body.clientWidth,FixWidthOn+22)
				- gpad*2 - 208 - 22 - 32;
      if (WorkingWidth < 351){
        WorkingWidth = 351;
      }
    }
    var BlocksPerLine = Math.floor(WorkingWidth/BlockWidth);
    var CanAddPixels = Math.floor((WorkingWidth - BlockWidth * BlocksPerLine)/BlocksPerLine);
    BlockCSS.width=(BlockWidth + CanAddPixels - Padding) + 'px';

    if (TitleWidth + CanAddPixels > 0)
			TitleCSS2.width=TitleCSS1.width=(TitleWidth + CanAddPixels) + 'px';
  }

}

function FindMaxWH( all_elements ) {
    var el = all_elements.filter(":first");
    var maxH = el.parent().height();
    var maxW = el.parent().width();

    var text;
    var oldtext = el.attr('title') || el.html();
    var newtext = "ЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖЖ";
    var real_max_w;
    var real_max_h;

    if ( !el.length ) return;

    el.html( newtext );
    var start = el.outerWidth() < maxW;
    do {
      text = newtext;
      if ( start ) {
	newtext = newtext + "Ж";
      } else {
	newtext = newtext.substring( 0, text.length - 1 );
      }
      el.html( newtext );
    } while ( ( el.outerWidth() < maxW ) == start );

    real_max_w = text.length;
    real_max_h = 0;
    newtext = text;

    do {
      text = newtext;
      real_max_h++;
      newtext = newtext + " " + newtext;
      el.html( newtext );
    } while ( el.outerHeight() < maxH );

    el.html( oldtext );
    return { 'maxH': maxH, 'maxW': maxW, 'real_max_h': real_max_h, 'real_max_w': real_max_w };
}

function MakeEllipsis(){
  var ellipsis_elements = new Array(
    jQuery(".ell_new").not(".ellE1, .ellA1, .ellT1, .no_ellipsis").find("a"),
    jQuery(".ellE1").not(".ellA1, .ellT1").find("a")
  );

  if(jQuery().ellipsis) {
    for ( var i = 0; i < ellipsis_elements.length; i++ ) {
      var all_elements = ellipsis_elements[i];
      var size = FindMaxWH( all_elements );

      if ( size && size.maxW && size.maxH && size.real_max_w && size.real_max_h ) {
				all_elements.ellipsis( size.maxW, size.maxH, size.real_max_w, size.real_max_h );
      }
    }
  }
  //jQuery(".ellP4 a").ellipsis(65,16);
}

function GetPadding(){
  var gwidth = document.body.clientWidth;
  var gpad = (gwidth>=FixWidthOn)?50:5*(gwidth-980)/62;
  gpad = (gpad>0)?parseInt(gpad):0;
	return gpad;
}

function MainDivResize(init) {
  var gpad = GetPadding();
  var maxwidth = FixWidthOn-gpad*2;
	if(typeof MainDivCSS !== 'undefined'){
		MainDivCSS.maxWidth=maxwidth + 'px';
		MainDivCSS.paddingLeft=gpad + 'px';
		MainDivCSS.paddingRight=gpad + 'px';
		//$("#main-div").css({'max-width':maxwidth+'px','padding-left':gpad+'px','padding-right':gpad+'px'});
		//$(".top_bubble").css({'width':100-parseInt(gpad*3/5)+'%'});
		if (!init && $.browser.msie && $.browser.version.substr(0,1)<7 && $("#main-div").width()>maxwidth) {$("#main-div").width(maxwidth);} //awesome!
		$("#dynamics_padd").css("paddingLeft", MainDivCSS.paddingLeft);
	}

}

BodyEndFunc.push({
  'za_MHNNS': MakeHotNewNormalSize,
  'zb_ellipsis': MakeEllipsis
});

WinResizeFunc.push({'zz_resize_MHNNS': function(){MakeHotNewNormalSize(); MakeEllipsis();}});

BodyLoadFunc.push({
  'menuscroll': function(){ var menuscroll = new SimpleScroller;},
  'za_HNNS': MakeHotNewNormalSize
});


var sfac_delay=false;
var sfac_tdelay=false;
var sfac_sel=-1;
var sfac_pps;
var sfac_timeout;
var sfac_cache = {};

// old spotlight request ID, we can cancel this
// if we get new request, but this didnt fired and in queue
var sfac_ID = 0;

function sfac_init(){
	var inp=$("#q");
	inp
		.keydown(function(e) {
			if(e.keyCode==13&&document.getElementById("nspotlight").style.display!='none'&&!sfac_keyEvent(e.keyCode)) {
				e.preventDefault();
				return false;
			}
		})
		.keyup(function(e) {
			if (e.keyCode == 39 || e.keyCode == 37) return false;
			if((e.keyCode==38||e.keyCode==40)&&document.getElementById("nspotlight").style.display!='none'&&!sfac_keyEvent(e.keyCode)) {
				e.preventDefault();
				return false;
			}
			if(sfac_pps==undefined) {
				sfac_request();
			} else sfac_delay=true;
			clearTimeout(sfac_pps);
			sfac_pps=setTimeout(function(){sfac_pps=undefined; if(sfac_delay) sfac_request();},50);

		})
		.blur(function() {
			sfac_delay=false;
			sfac_tdelay=false;
			sfac_sel=-1;
			clearTimeout(sfac_pps);
			clearTimeout(sfac_timeout);
			setTimeout(function(){document.getElementById("nspotlight").style.display='none';},200);
		})
		.focus(function() {
			if (sfac_check(inp.val())) {
				document.getElementById("nspotlight").style.display='block';
				if(sfac_pps==undefined) {
					sfac_request();
				} else {
					sfac_delay=true;
				}
				clearTimeout(sfac_pps);
				sfac_pps=setTimeout(function(){sfac_pps=undefined; if(sfac_delay) sfac_request();},50);
			}
		});
	$('<div id="sfac_cont" id="srch_popup"><div id="nspotlight" class="nspotlight"/></div>').insertAfter(inp);

	$('#s-sample').click(function(){
		inp.val($(this).text()).removeClass('def_txt').focus();
		sfac_request();
	});

	var $go = $('#go');
	$go.attr("data-disabled", "disabled");
	inp.on('keydown keyup blur focus',function() {
		if (sfac_check(inp.val())) {
			$go.removeAttr('data-disabled');
		}else{
			$go.attr("data-disabled", "disabled");
		}
	});
	$go.on('click', function() {
		if ($(this).attr('data-disabled')) {
			alert(__l('Неверный поисковый запрос'));
			return false;
		}
	});
}

/* back to revert [36980] or [37938] */
function sfac_request(value) {
	sfac_delay = false;

	// [78331] Сверстать новый спотлайт-поиск
	var artMemName = {
		text: __l('Электронная книга'),
		audio: __l('Аудиокнига'),
		mmedia: __l('Аудиокнига'),
		hardcopy: __l('Бумажная книга'),
		english: __l('Электронная книга')
	};

	function isLat(val) {
		return /^[\w\[\]\{\}\,\.\<\>\s\?\!]+$/.test(val);
	}
	function sfac_onetower(obj) {
	  obj.toggleClass('nspotlight_small', obj.outerWidth(true) < 500);
	  obj.toggleClass('nspotlight_mid', obj.outerWidth(true) < 800);
	}
	function getImgPath(cover, no_photo) {
		if (cover != null)
			return cover.replace(/https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\//g, '').replace('cover', 'cover_37').replace('.png', '.jpg');
		return no_photo;
	}

	var val = document.getElementById("q").value;
	if (sfac_timeout == undefined) {
		sfac_tdelay = false;
		clearTimeout(sfac_timeout);
		if (sfac_check(val)) {
			sfac_sel = -1;

			if (!window.QSRequestID) {
				window.QSRequestID = 1
			} else {
				window.QSRequestID++;
			}
			var QSRequestID = window.QSRequestID;

			function spotLight(pobj) {
				if (sfac_cache.hasOwnProperty(pobj.q)) {
					renderSearchRows(sfac_cache[pobj.q], pobj);
				} else {
					if (sfac_ID) {
						GUJ.CancelRequest(sfac_ID);
					}

					sfac_ID = GUJ.PutRequest({
						url: '/pages/search_slice/',
						params: pobj,
						HttpRType: 'json',
						QSRequestID: QSRequestID,
						OnData: function (data) {
							if (this.QSRequestID != window.QSRequestID) {
								return;
							}

							sfac_cache[val] = data;

							renderSearchRows(data, pobj);
						}
					});
				}
			}
			spotLight({json: 1, q: val, limit: 9});

			sfac_timeout = setTimeout(function () {
				sfac_timeout = undefined;
				if (sfac_tdelay) sfac_request();
			}, 100);

			function renderSearchRows(data, pobj) {
				var nspotlight = $('#nspotlight'),
					html_tmp = '',
					out = $('<ul></ul>'),
					height = $.browser.webkit ? document.documentElement.clientHeight : $(window).height(),
					currentType;

				height -=  $('#sfac_cont').offset().top - $(document).scrollTop() - 50;

				if (isLat(val) && !data.result && !pobj.t) {
				  return spotLight({ json: 1, q: val, limit: 9, t: 1 });
				}

				if (!data.result) {
					return;
				}

				function showRows(item) {
					if (item.item_type == null || !item.item_type) return;

					if (!item.url && item.id) {
					  switch (item.item_type) {
						case 'art':
						  item.url = '/pages/biblio_book/?art=' + item.id;
						  break;
						case 'author':
						  item.url = '/pages/biblio_authors/?subject=' + item.id;
						  break;
						case 'author':
						  item.url = '/pages/tags/?tag=' + item.id;
						  break;
						case 'series':
						  item.url = '/pages/biblio_series/?id=' + item.id;
						  break;
						case 'collections':
						  item.url = '/pages/biblio_collection/?collection=' + item.id;
						  break;
						case 'copyright_page':
								item.url = '/pages/izdatelstva/?izdatel=' + item.id;
								break;
					  }
					}

					html_tmp =
						'<li>' +
							'<div data-link="' + item.url + '" class="nspotlight__item">' +
								drawImage(item) +
								drawTitle(item, data) +
								drawButton(item, data) +
							'</div>' +
						'</li>';
					currentType = item.atype;
					out.append(html_tmp);
				}

				for (var j = 0; j < data.result.length; j++) {
					showRows(data.result[j]);
				}

				if (out.children().length) {
					nspotlight.html('<ul class="nspotlight__items">' + out.html() + '</ul>');
					if (data.result.length > 6) {
						var searc_url = '/pages/rmd_search/?q=';

						nspotlight.find('ul').append('<li><div data-link="'+ searc_url + val +'" class="nspotlight__item nspotlight__item_showall">' +
							'<a class="nspotlight__showall" href="'+ searc_url + val +'">' + __l('Показать все результаты') + '</a></div></li>');
					}
					nspotlight.slideDown(200, function () {
						while(nspotlight.height() > height) {
							nspotlight.find('ul').children().last().prev().remove();
						}
					});
					nspotlight.find('ul li').click(function (e) {
						e = e || event;
						if ($(e.target).is('a[href]')) {
							window.location = $(e.target).attr('href');
						} else {
							window.location = $(this).find('div').data('link');
						}
						return false;
					});
					nspotlight.find('ul li').on('hover', function(){
						$(this).add($(this).find('.spotitem')).toggleClass('hover');
					});
					$(window).resize(function() {
						sfac_onetower(nspotlight);
					});
					sfac_onetower(nspotlight);
				}

				//	временный фикс, нужно как то оптимизировать
				nspotlight.find('li.s').prev('li').find('div.spotitem').addClass('before_s_li');
			}
			function drawImage (item) {
				var html = "";
				html += '<a title="' + item.title + '" href="' + item.url + '" class="nspotlight__img nspotlight__item_td">';
				if (item.arts) {
					html += '<span class="nspotlight__cover_multiple">';
					for (var i = 0; i < item.arts.length; i++) {
						html += drawCover({
							release_file: item.arts[i].release_file,
							cover: item.arts[i].cover,
							photo: item.arts[i].photo,
							id: item.arts[i].id,
							title: item.title,
							addClass: 'nspotlight__cover_' + (i+1),
							ratio: item.arts[i].cover_ratio,
							type: item.item_type,
							mem: item.mem,
							art_type: item.type,
							url: item.url
						});
					}
					html += '</span>';
				} else {
					html += drawCover({
						release_file: item.release_file,
						cover: item.cover,
						photo: item.photo,
						id: item.id,
						title: item.title,
						ratio: item.cover_ratio,
						type: item.item_type,
						mem: item.mem,
						art_type: item.type,
						url: item.url
					});
				}

				html += '</a>';
				return html;
			}
			/*
			 * param @obj:
			 *	release_file - построение урла к картинке
			 *	ratio - соотношение ширины / высоты
			 *	addClass - добаление класса к картинки
			 *	title - alt картинки
			 *	type - тип объекта [author|art|tag|serie|genre]
			 *	mem - мем тип объекта
			*/
			function drawCover(obj){

				var width = 30;

				if (obj.type === 'author') {
					width = 50;
					obj.ratio = 1;
					if (!obj.release_file && !obj.cover && !obj.photo) {
						obj.release_file = '//www.litres.ru/static/litres/i/header/search/no_img/author.svg';
					} else {
						obj.release_file = drawCoverUrl(obj, width);
					}
				}

				var height = Math.round(width / obj.ratio);
				var html = '';
				if (obj.type === 'author') {
					html = '<span class="nspotlight__cover nspotlight__cover_' + obj.type + (obj.addClass ? ' ' + obj.addClass : '' ) + '" ' +
					' style="' +
						'background: url('+ obj.release_file +') no-repeat center center;' +
						'width:' + width + 'px;' +
						'height:' + height + 'px;' +
					'" title="' + obj.title + '"></span>';
				} else {
					html = '<span class="cover nspotlight__cover' + ' nspotlight__cover_' + obj.type + (obj.addClass ? ' ' + obj.addClass : '' ) + '"><img src="' + drawCoverUrl(obj, width) + '" width="' + width + '" height="' + height + '" alt="' + obj.title + '" onerror="this.dataset.coverError = 1; setErrorCover();"/></span>';
				}
				return html;
			}
			function drawTitle(item, data) {
				var FixedStr = data.search_string ? data['search_string'].replace(/[еэё]/i,'[еэё]').replace(/[ий]/i,'[ий]') : '';
				var hint = '';
				switch (item.item_type) {
					case 'author':
						hint = __l('Автор');
						break;
					case 'art':
						if (item.persons && item.persons.person) {

							var authors = $.grep(item.persons.person, function(n, i) {
								return n.relation == 0;
							});
							if (authors.length == 1) {
								hint = authors[0].s_full_name;
							} else {
								var hint1 = '', hint2 = authors[authors.length - 1].s_full_name;
								for (var i = 0; i < authors.length - 1; i++) {
									hint1 += authors[i].s_full_name;
									if (i != authors.length - 2) {
										hint1 += ', ';
									}
								}
								// i18n Автор1, Автор2 и Автор3.
								hint = __l('{hint1} и {hint2}.', {hint1: hint1, hint2: hint2});
							}
						}
						if (artMemName[item.mem]) {
							hint += ' ' + artMemName[item.mem];
						}
						break;
					case 'tag':
						hint = __l('Тег');
						break;
					case 'serie':
						hint = __l('Серия');
						break;
					case 'collection':
						hint = __l('Коллекция');
						break;
					case 'genre':
						hint = __l('Жанр');
						break;
					case 'copyright_page':
						hint = __l('Издательство');
						break;
					default:
						// code
				}
				var className = 'nspotlight__title' + (item.owned ? ' nspotlight__title_purchased' : '');
				var html = '<div class="nspotlight__details nspotlight__item_td">' +
						(hint ? '<span class="nspotlight__hint">' + hint + '</span>' : '' ) +
						'<a href="' + item.url + '" title="' + item.title + '" class="' + className + '">' +
							(isLat(val) ? item.title : item.title.replace(new RegExp("(" + FixedStr + ")", "gi"), "<b>$1</b>")) +
						'</a>' +
					'</div>';
				return html;
			}
			function drawButton(item, data) {
				var html = ''
				if (item.owned) {
					var href;
					var text;
					switch (item.mem) {
						case 'audio':
							text = __l('Слушать');
							href = item.url + '#play_now';
							break;
						case 'text':
							if (item.percent) {
								text = __l('Продолжить чтение с {percent}%', {percent: Math.round(item.percent)});
							} else {
								text = __l('Читать');
							}
							var itemType = item.type
							if (itemType !== undefined) {
								itemType = parseInt(item.type, 10);
							}
							switch (itemType) {
								case 4:
									href = '/static/or3/view/or.html?art_type=4&file=' + item.file_id + '&bname=' + encodeURIComponent(encodeURIComponent(item.title)) + '&art=' + item.id + '&user=' + litres.user + '&uuid=' + item.uuid + '&cover=' + encodeURIComponent(item.img);
									break;
								default:
									href = '/static/or4/view/or.html?baseurl=/download_book/' + item.id + '/' + item.release_file + '/&uuid=' + item.uuid + '&art=' + item.id + '&user=' + litres_user_id;
							}
							break;
						default:
							href = item.url;
							text = __l('Читать');
					}
					html = '<div class="nspotlight__buttons nspotlight__item_td">' +
						'<a href="' + href + '" class="nspotlight__read">' + text + '</a>' +
					'</div>';
				}
				return html;
			}

		} else {
			document.getElementById("nspotlight").style.display='none';
		}
	} else {
		sfac_tdelay = true;
	}
}

function sfac_keyEvent(keyCode) {
	var aList = $('#nspotlight li:not(.m, .s)');
	if (keyCode == 13) {
		if (sfac_sel == -1) return true;
		document.location.href = $(aList[sfac_sel]).find('a').attr('href');
	}
	if ((keyCode == 38 && sfac_sel >= 0) || (keyCode == 40 && sfac_sel < aList.length-1)) {
		for (i in aList) { aList[i].className = ""; }
		sfac_sel += (keyCode == 38 ? -1 : 1);
		if (sfac_sel >= 0 && sfac_sel < aList.length) aList[sfac_sel].className = "sfacSelected";
	}
	return false;
}

// отрисовка обложки книги и авторов
function drawCoverUrl(obj, width){
	var url = "", releaseId = "";
	var releaseFile = String(obj.id);

	if(obj.type == 'author'){
		if (releaseFile.length < 8) { // 8 - разрядность id файла. если короче, добавить 0
			var i = 0;
			while (i < 8 - releaseFile.length) {
				releaseId += "0";
				i++;
			}
		}
		releaseId += releaseFile;
		var releaseIdTemp = releaseId.slice(0,2) + "/" + releaseId.slice(2,4) + "/" + releaseId.slice(4,6);
		url = "//litres.ru/static/authors/100/" + releaseIdTemp + "/" + releaseId + "_" + width + "."+ obj.photo +"";
	}else{
		var CoverDomain = "cv" + releaseFile.substr(releaseFile.length-2, 1), artType, artUrl, partsUrl;
		switch (obj.art_type) {
			case 0: case 18:
				artType = "elektronnaya-kniga";
				break;
			case 1:
				artType = "audiokniga";
				break;
			case 4:
				artType = "pdf-kniga";
				break;
			case 11:
				artType = "gardners-kniga";
				break;
			case 12: case 16:
				artType = "bumajnaya-kniga";
				break;
		}
		if (obj.url.indexOf('biblio_book') == -1) {
			partsUrl = obj.url.split('/');
			artUrl = partsUrl[1] + '-' + partsUrl[2];
		} else {
			artUrl = "pages-biblio-book-art-" + obj.id;
		}
		url = "https://" + CoverDomain + ".litres.ru" + "/pub/c/" + artType + "/cover_" + width + "/"+ obj.id + '-' + artUrl + '.' + obj.cover;
	}

	return url;
}

/**
 * [136569] Верстке не передавать поисковые запросы с количеством букв меньше 3-х
 * поисковая строка должна содержать не менее двух цифр либо более двух символов, не содержащих спецсимволы
 * @param {String} query - проверяем текст
 * @return {Boolean} валидность строки для поиска
 */
function sfac_check(query) {
	if (query.replace(/[\s\\\/~#$%^&*(),._!@"№;:?=«»'\[\]\{\}`\+\-\<\>]/g, "").length > 2 || /^\d{2,}?$/.test(query)) {
		return true;
	}
	return false;
}


/*paginator*/
var Paginator = function(paginatorHolderId, pagesTotal, pagesSpan, pageCurrent, baseUrl, moreSettings){
	if(!document.getElementById(paginatorHolderId) || !pagesTotal || !pagesSpan) return false;
//
	this.inputData = {
		paginatorHolderId: paginatorHolderId,
		pagesTotal: pagesTotal,
		pagesSpanOrig: pagesSpan,
		pagesSpan: pagesSpan < pagesTotal ? pagesSpan : pagesTotal,
		pageCurrent: pageCurrent,
		baseUrl: baseUrl ? baseUrl : '/pages/',
		align: 'justify',
		scrollBtn: 'none',
		scrollBtnCaptionL: '«',
		scrollBtnCaptionR: '»'
	};
	for (var i in moreSettings){
		this.inputData[i] = moreSettings[i];
	}
	if (pagesSpan > pagesTotal) this.inputData.scrollBtn = 'none';
	else this.inputData.align = 'justify';

	this.html = {
		holder: null,

		table: null,
		trPages: null,
		trScrollBar: null,
		tdsPages: null,

		scrollBar: null,
		scrollThumb: null,

		pageCurrentMark: null
	};


	this.prepareHtml();

	this.initScrollThumb();
	this.initPageCurrentMark();
	this.initEvents();

	this.scrollToPageCurrent();
}

/*
	Set all .html properties (links to dom objects)
*/
Paginator.prototype.prepareHtml = function(){

	this.html.holder = document.getElementById(this.inputData.paginatorHolderId);
	this.html.holder.innerHTML = this.makePagesTableHtml();

	this.html.table = this.html.holder.getElementsByTagName('table')[0];

	var trPages = this.html.table.getElementsByTagName('tr')[0];

	this.html.tdsPages = new Array;
	this.html.skeepedTds = new Array;
	var tds = trPages.getElementsByTagName('td');
	for (var i=0; i < tds.length; i++){
		if (tds[i].className.match(/scrollBtn/)){
			var tmp = tds[i].getElementsByTagName('a')[0];
			if			(tmp.className.match(/scrollBtnL/)) this.html.scrollBtnL = tds[i];
			else if	(tmp.className.match(/scrollBtnR/)) this.html.scrollBtnR = tds[i];
			continue;
		}
		if (tds[i].style.visibility == 'hidden') {
			this.html.skeepedTds.push(tds[i]);
			continue;
		}
		this.html.tdsPages.push(tds[i]);
	}

	this.html.scrollBar = getElementsByClassName(this.html.table, 'div', 'scroll_bar')[0];
	this.html.scrollThumb = getElementsByClassName(this.html.table, 'div', 'scroll_thumb')[0];
	this.html.pageCurrentMark = getElementsByClassName(this.html.table, 'div', 'current_page_mark')[0];

	// hide scrollThumb if there is no scroll (we see all pages at once)
	if(this.inputData.pagesSpan == this.inputData.pagesTotal){
		addClass(this.html.holder, 'fullsize');
	}
}

/*
	Make html for pages (table)
*/
Paginator.prototype.makePagesTableHtml = function(){
	var tdWidth = (100 / ((this.inputData.align == 'justify' ? this.inputData.pagesSpan : this.inputData.pagesSpanOrig) + (this.inputData.scrollBtn.match(/left|right/) ? 1 : this.inputData.scrollBtn == 'both' ? 2 : 0))) + '%';

	var html = '' +
	'<table>' +
		'<tr>' +
			(this.inputData.align.match(/right|center/) ? '<td style="visibility: hidden;"></td>' : '') +
			(this.inputData.scrollBtn.match(/left|both/) ? '<td class="scrollBtn" width="' + tdWidth + '"><a href="#" class="scrollBtnL">'+this.inputData.scrollBtnCaptionL+'</a></td>' : '');
			for (var i=1; i<=this.inputData.pagesSpan; i++){
				html += '<td width="' + tdWidth + '" class="paginator_cell"></td>';
			}
			html += '' +
			(this.inputData.scrollBtn.match(/right|both/) ? '<td class="scrollBtn" width="' + tdWidth + '"><a href="#" class="scrollBtnR">'+this.inputData.scrollBtnCaptionR+'</a></td>' : '') +
			(this.inputData.align.match(/left|center/) ? '<td style="visibility: hidden;"></td>' : '')+
		'</tr>' +
		'<tr>' +
			(this.inputData.align.match(/right|center/) ? '<td style="visibility: hidden;"></td>' : '') +
			'<td colspan="' + (this.inputData.pagesSpan +
													(this.inputData.scrollBtn.match(/left|right/) ? 1 : this.inputData.scrollBtn == 'both' ? 2 : 0)
													) + '">' +
				'<div class="scroll_bar">' +
					'<div class="scroll_trough"></div>' +
					'<div class="scroll_thumb">' +
						'<div class="scroll_knob"></div>' +
					'</div>' +
					'<div class="current_page_mark"></div>' +
				'</div>' +
			'</td>' +
			(this.inputData.align.match(/left|center/) ? '<td style="visibility: hidden;"></td>' : '')+
		'</tr>' +
	'</table>';

	return html;
}

/*
	Set all needed properties for scrollThumb and it's width
*/
Paginator.prototype.initScrollThumb = function(){
	this.html.scrollThumb.widthMin = '8'; // minimum width of the scrollThumb (px)
	this.html.scrollThumb.widthPercent = this.inputData.pagesSpan/this.inputData.pagesTotal * 100;

	this.html.scrollThumb.xPosPageCurrent = (this.inputData.pageCurrent - Math.round(this.inputData.pagesSpan/2))/this.inputData.pagesTotal * (this.html.table.offsetWidth - this.skeepWidth());
	this.html.scrollThumb.xPos = this.html.scrollThumb.xPosPageCurrent;

	this.html.scrollThumb.xPosMin = 0;
	this.html.scrollThumb.xPosMax;

	this.html.scrollThumb.widthActual;

	this.setScrollThumbWidth();

}

Paginator.prototype.skeepWidth = function(){
	var w = 0;
	for (var i = 0; i < this.html.skeepedTds.length; i++){
		w += this.html.skeepedTds[i].offsetWidth;
	}
	return w;
}

Paginator.prototype.setScrollThumbWidth = function(){
	// Try to set width in percents
	this.html.scrollThumb.style.width = this.html.scrollThumb.widthPercent + "%";

	// Fix the actual width in px
	this.html.scrollThumb.widthActual = this.html.scrollThumb.offsetWidth;

	// If actual width less then minimum which we set
	if(this.html.scrollThumb.widthActual < this.html.scrollThumb.widthMin){
		this.html.scrollThumb.style.width = this.html.scrollThumb.widthMin + 'px';
	}

	this.html.scrollThumb.xPosMax = this.html.table.offsetWidth - this.skeepWidth() - this.html.scrollThumb.widthActual;
}

Paginator.prototype.moveScrollThumb = function(){
	this.html.scrollThumb.style.left = this.html.scrollThumb.xPos + "px";
}


/*
	Set all needed properties for pageCurrentMark, it's width and move it
*/
Paginator.prototype.initPageCurrentMark = function(){
	this.html.pageCurrentMark.widthMin = '3';
	this.html.pageCurrentMark.widthPercent = 100 / this.inputData.pagesTotal;
	this.html.pageCurrentMark.widthActual;

	this.setPageCurrentPointWidth();
	this.movePageCurrentPoint();
}

Paginator.prototype.setPageCurrentPointWidth = function(){
	// Try to set width in percents
	this.html.pageCurrentMark.style.width = this.html.pageCurrentMark.widthPercent + '%';

	// Fix the actual width in px
	this.html.pageCurrentMark.widthActual = this.html.pageCurrentMark.offsetWidth;

	// If actual width less then minimum which we set
	if(this.html.pageCurrentMark.widthActual < this.html.pageCurrentMark.widthMin){
		this.html.pageCurrentMark.style.width = this.html.pageCurrentMark.widthMin + 'px';
	}
}

Paginator.prototype.movePageCurrentPoint = function(){
	if(this.html.pageCurrentMark.widthActual < this.html.pageCurrentMark.offsetWidth){
		this.html.pageCurrentMark.style.left = (this.inputData.pageCurrent - 1)/this.inputData.pagesTotal * (this.html.table.offsetWidth - this.skeepWidth()) - this.html.pageCurrentMark.offsetWidth/2 + "px";
	} else {
		this.html.pageCurrentMark.style.left = (this.inputData.pageCurrent - 1)/this.inputData.pagesTotal * (this.html.table.offsetWidth - this.skeepWidth()) + "px";
	}
}



/*
	Drag, click and resize events
*/
Paginator.prototype.initEvents = function(){
	var _this = this;

	this.html.scrollThumb.onmousedown = function(e){
		if (!e) var e = window.event;
		e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();

		var dx = getMousePosition(e).x - this.xPos;
		document.onmousemove = function(e){
			if (!e) var e = window.event;
			_this.html.scrollThumb.xPos = getMousePosition(e).x - dx;

			// the first: draw pages, the second: move scrollThumb (it was logically but ie sucks!)
			_this.moveScrollThumb();
			_this.drawPages();


		}
		document.onmouseup = function(){
			document.onmousemove = null;
			_this.enableSelection();
		}
		_this.disableSelection();
	}

	this.html.scrollBar.onmousedown = function(e){
		if (!e) var e = window.event;
		if(matchClass(_this.paginatorBox, 'fullsize')) return;

		_this.html.scrollThumb.xPos = getMousePosition(e).x - getPageX(_this.html.scrollBar) - _this.html.scrollThumb.offsetWidth/2;

		_this.moveScrollThumb();
		_this.drawPages();


	}

	if (this.html.scrollBtnL){
		this.html.scrollBtnL.getElementsByTagName('a')[0].onclick = function(){
			_this.html.scrollThumb.xPos -=
				(
					(_this.html.table.offsetWidth - _this.skeepWidth()) /
					_this.inputData.pagesTotal * (_this.inputData.pagesSpan)
				);
			_this.moveScrollThumb();
			_this.drawPages();
			return false;
		}
	}
	if (this.html.scrollBtnR){
		this.html.scrollBtnR.getElementsByTagName('a')[0].onclick = function(){
			_this.html.scrollThumb.xPos +=
				(_this.html.scrollThumb.xPos == 0 ? 2 : 0) +
				(
					(_this.html.table.offsetWidth - _this.skeepWidth()) /
					_this.inputData.pagesTotal * (_this.inputData.pagesSpan)
				);
			_this.moveScrollThumb();
			_this.drawPages();
			return false;
		}
	}

	// Comment the row beneath if you set paginator width fixed
	//	addEvent(window, 'resize', function(){Paginator.resizePaginator(_this)});
	WinResizeFunc.push({'resizePaginator': function(){Paginator.resizePaginator(_this);}});
}

/*
	Redraw current span of pages
*/
Paginator.prototype.drawPages = function(){
	var percentFromLeft = this.html.scrollThumb.xPos/(this.html.table.offsetWidth - this.skeepWidth());
	var cellFirstValue = Math.round(percentFromLeft * this.inputData.pagesTotal);

	var html = "";
	// drawing pages control the position of the scrollThumb on the edges!
	if(cellFirstValue < 1){
		cellFirstValue = 1;
		this.html.scrollThumb.xPos = 0;
		this.moveScrollThumb();
	} else if(cellFirstValue >= this.inputData.pagesTotal - this.inputData.pagesSpan) {
		cellFirstValue = this.inputData.pagesTotal - this.inputData.pagesSpan + 1;
		this.html.scrollThumb.xPos = this.html.table.offsetWidth - this.skeepWidth() - this.html.scrollThumb.offsetWidth;
		this.moveScrollThumb();
	}
	if (this.html.scrollBtnL){
		if (cellFirstValue == 1) {
			if (this.html.scrollBtnL && !this.html.scrollBtnL.className.match(/\s*disable/i))
				this.html.scrollBtnL.className += ' disable';
		} else this.html.scrollBtnL.className = this.html.scrollBtnL.className.replace(/\s*disable/gi,'');
	}
	if (this.html.scrollBtnR){
		if (cellFirstValue == this.inputData.pagesTotal - this.inputData.pagesSpan + 1){
			if (this.html.scrollBtnR && !this.html.scrollBtnR.className.match(/\s*disable/i))
				this.html.scrollBtnR.className += ' disable';
		} else this.html.scrollBtnR.className = this.html.scrollBtnR.className.replace(/\s*disable/gi,'');
	}

	for(var i=0; i<this.html.tdsPages.length; i++){
		var cellCurrentValue = cellFirstValue + i;
		if(cellCurrentValue == this.inputData.pageCurrent){

			html = "<span><span class='line'></span>" + "<strong>" + cellCurrentValue + "</strong>" + "</span>";
		} else {
			var Url = this.inputData.baseUrl;
			if(cellCurrentValue==1) {
				Url = Url.replace(/(?:\&?pagenum=current_page|\/page\-current_page)/,'')
				Url = Url.replace(/limit=\d+&?/, "")
				Url = Url.replace(/(\?|&)$/, "")
			}
			html = "<span>" + "<a href='" + Url.replace("current_page",cellCurrentValue) + "'>" + cellCurrentValue + "</a>" + "</span>";
		}
		this.html.tdsPages[i].innerHTML = html;
	}
}

/*
	Scroll to current page
*/
Paginator.prototype.scrollToPageCurrent = function(){
	this.html.scrollThumb.xPosPageCurrent = (this.inputData.pageCurrent - Math.round(this.inputData.pagesSpan/2))/this.inputData.pagesTotal * (this.html.table.offsetWidth - this.skeepWidth());
	this.html.scrollThumb.xPos = this.html.scrollThumb.xPosPageCurrent;

	this.moveScrollThumb();
	this.drawPages();

}



Paginator.prototype.disableSelection = function(){
	document.onselectstart = function(){
		return false;
	}
	this.html.scrollThumb.focus();
}

Paginator.prototype.enableSelection = function(){
	document.onselectstart = function(){
		return true;
	}
}

/*
	Function is used when paginator was resized (window.onresize fires it automatically)
	Use it when you change paginator with DHTML
	Do not use it if you set fixed width of paginator
*/
Paginator.resizePaginator = function (paginatorObj){

	paginatorObj.setPageCurrentPointWidth();
	paginatorObj.movePageCurrentPoint();

	paginatorObj.setScrollThumbWidth();
	paginatorObj.scrollToPageCurrent();
}




/*
	Global functions which are used
*/
function getElementsByClassName(objParentNode, strNodeName, strClassName){
	var nodes = objParentNode.getElementsByTagName(strNodeName);
	if(!strClassName){
		return nodes;
	}
	var nodesWithClassName = [];
	for(var i=0; i<nodes.length; i++){
		if(matchClass( nodes[i], strClassName )){
			nodesWithClassName[nodesWithClassName.length] = nodes[i];
		}
	}
	return nodesWithClassName;
}

function addEvent(objElement, strEventType, ptrEventFunc) {
	if (objElement.addEventListener)
		objElement.addEventListener(strEventType, ptrEventFunc, false);
	else if (objElement.attachEvent)
		objElement.attachEvent('on' + strEventType, ptrEventFunc);
}
function removeEvent(objElement, strEventType, ptrEventFunc) {
	if (objElement.removeEventListener) objElement.removeEventListener(strEventType, ptrEventFunc, false);
		else if (objElement.detachEvent) objElement.detachEvent('on' + strEventType, ptrEventFunc);
}


function getPageY( oElement ) {
	var iPosY = oElement.offsetTop;
	while ( oElement.offsetParent != null ) {
		oElement = oElement.offsetParent;
		iPosY += oElement.offsetTop;
		if (oElement.tagName == 'BODY') break;
	}
	return iPosY;
}

function getPageX( oElement ) {
	var iPosX = oElement.offsetLeft;
	while ( oElement.offsetParent != null ) {
		oElement = oElement.offsetParent;
		iPosX += oElement.offsetLeft;
		if (oElement.tagName == 'BODY') break;
	}
	return iPosX;
}

function getMousePosition(e) {
	if (e.pageX || e.pageY){
		var posX = e.pageX;
		var posY = e.pageY;
	}else if (e.clientX || e.clientY) 	{
		var posX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		var posY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	return {x:posX, y:posY}
}

/*ellipsis*/

jQuery.fn.ellipsis = function(
  maxW,       // element max width (px)
  maxH,       // element max height (px)
  orig_max_w, // element max length (chars)
  real_max_h, // element max height (lines)
  start
) {
	return this.each(function(){
		var el = $(this);
		var title = el.attr('data-title');
		var mH = maxH || parseInt(el.parent().css('maxHeight'));
		if (!mH || mH <= 0) mH = el.parent().height();
		var mW = maxW || parseInt(el.parent().css('maxWidth'));
		if (!mW || mW <= 0) mW = el.parent().width();

		var oT = title || el.text(); //text
		if (!title) {
			el.not('.nott').attr('data-title', oT);
		} else el.text(oT);

		var ch = oT.length; //characters
		var s = start || parseInt(ch / 2); //step

		if ( ch < orig_max_w ) {
			el.removeAttr('data-title');
			return;
		}

		var real_max_w = Math.round( orig_max_w / 0.65 );
		var words = oT.split( /[ -]/ );
		var curr_line    = 0;
		var line_length  = 0;
		var total_length = 0;
		var need_dots    = 0;
		var i            = 0;
		while ( curr_line < real_max_h && i < words.length ) {
		  var w_len = words[i].length;

		  if ( w_len >= real_max_w ) {
		    total_length += real_max_w + 1;
		    break;
		  } else if ( line_length + w_len > real_max_w ) {
		    curr_line++;
		    if (curr_line < real_max_h) {
		      total_length += w_len + 1;
		      line_length   = w_len + 1;
		     } else {
		      total_length += real_max_w + 1 - line_length;
		     }
		  } else {
		    total_length += w_len + 1;
		    line_length  += w_len + 1;
		  }
		  i++;
		}

		if ( total_length < ch ) {
		  oT = oT.substring( 0, total_length - 2 );
		  oT = oT.replace( /[ -\:\,\.]+$/, "" );
		  oT += "…";
		}

		var first_try = 1;

		ch = oT.length;
		s = ch / 2;
		el.text( oT );

		var nT = oT; //newText
		while (s > 1) {
			el.text(nT);

			var oH = el.outerHeight(), oW = el.outerWidth();
			if ( oH <= mH && oW <= mW ) {
				if ( first_try ) {
					s = 0;
				} else if (oT.length == nT.length) {
					s = 0;
				} else {
					ch += s;
					nT = oT.substring(0, ch);
				}
			} else {
				ch -= s;
				nT = nT.substring(0, ch);
			}
			s = parseInt(s / 2);
			first_try = 0;
		}
		if (oT.length > nT.length) {
			nT = nT.substring(0, nT.length - 2);
			el.text(nT + "…");
		} else if (!!el.attr('data-title') && el.attr('data-title').length == nT.length){
			el.removeAttr('data-title');
		}
	});
};

/* rus month */
function RusMonth(k) {
	var month = [];
	month[0]=__l("января");month[1]=__l("февраля");month[2]=__l("марта");month[3]=__l("апреля");month[4]=__l("мая");month[5]=__l("июня");month[6]=__l("июля");month[7]=__l("августа");month[8]=__l("сентября");month[9]=__l("октября");month[10]=__l("ноября");month[11]=__l("декабря");
	return month[k];
}

/* start ajax vote scroll */
function recense_vote( is_good ) {
	var button_parent = $(this).parent();

	button_parent.html("<img src='/static/new/i/ajax_progress.gif'>");

	CSRF.sendRequest({
		url: '/pages/ajax_empty2/',
		Method: 'post',
		params : { 'rec_id': $(this).attr("data-id"), 'is_good': is_good, 'action': 'recense_vote' },
		OnData: function( data ){

			var total = $(button_parent).parent().find("b").first();
			var label = $(button_parent).parent().find( is_good ? ".votes_good" : ".votes_bad" );

			var rating = parseInt( $(total).text() );
			rating += ( is_good ? 1 : -1 );

			$(total).text( ( rating > 0 ? "+" : "" ) + rating );
			$(label).text( parseInt( $(label).text() ) + 1 );

			$(total).attr("class", rating > 0 ? "dl" : rating == 0 ? "null" : "lt" );

			$(button_parent).html("<b>" + __l('Спасибо за Ваш голос!') + "</b>");
		}
	});
}

/* paper book action. 0 = remove 1, 1 = add  */
function Paper_Book_Basket(ArtID,e) {
	var paper_book = $('*[class~="in_basket_quality_'+ArtID+'"] span'),
			paper_count = parseInt(paper_book.eq(0).text());
	if (paper_count==(!e?1:0)) {
		!e?paper_book.parent().hide():paper_book.parent().show();
		if ($('.coolbtn_basket .coolbtn_basket_'+ArtID) && !e) $('.coolbtn_basket .coolbtn_basket_'+ArtID).show();
		else $('.coolbtn_basket .coolbtn_basket_'+ArtID).hide();
	}
	!e?paper_count--:paper_count++;
	paper_book.html(paper_count);
}
/* Validate Loyalty [32675] returns 1 if ok */
function LoyaltyValidate(loyalty, num) { // loyalty === mnogoru (12) || malina (16) || kukuruza (13) || perekrestok (16)
	if ((loyalty==='mnogoru' && /^\d{8}$/.test(num)) || ((loyalty==='malina' || loyalty==='perekrestok') && /^\d{16}$/.test(num)) || (loyalty==='kukuruza' && /^\d{13}$/.test(num)) || (loyalty === 'tnt' && CheckCardTNT(num)) ||
		(loyalty === 'beeline' && /^\d{13}$/.test(num)) ||
		(loyalty === 'rosneft' && /^700599\d{10}$/.test(num)) ||
		(loyalty === 'bpclub' && /^7005993\d{9}$/.test(num)) ||
		(loyalty === 'troyka' && /^\d{10}$/.test(num)) ||
		(loyalty === 'aeroflot' && checkAeroflotCard(num))
	) {
		return 1;
	}
	return __l('Карта {loyalty} заполнена некорректно!', {loyalty: LoyaltyName(loyalty)});
}

function CheckCardTNT(num){
  if(/^\d{10}$/.test(num)){
	num = num.toString();
	  var numLast=num.charAt(num.length-1),
	  numCount = num.slice(0, -1),
	  count = 0,
	  i;
	  for (i=0; i < numCount.length; i++) { // не берем последнюю цифру
		count+=parseInt(numCount[i]);
	  }
		return (count % 10 == numLast) ? true : false;
  }
  return false;
}

// [132860]
function checkAeroflotCard(num) {
	var cardNumStr = String(num).trim();
	var cardNum = Number(num)
	var oldCard = cardNum <= 20198716 && /^(\d{4,8})$/.test(cardNum);
	var newCard = cardNum >= 50101041 && /^(\d{8,10})$/.test(cardNum);
	var tempCardNum = '', result = 0, i = 0;

	if (cardNum > 0) {
		if (oldCard) {
			if (cardNumStr.length < 10) {
				for (i = 0; i < 10 - cardNumStr.length; i++) {
					tempCardNum += '0';
				}
				tempCardNum += cardNumStr;
			}
			for (i = 0; i < tempCardNum.length - 1; i++) {
				result += Number(tempCardNum[i]) * (i + 1);
			}
		}
		if (newCard) {
			result = Number(cardNumStr.slice(0, cardNumStr.length - 1));
			result = result - (parseInt(result / 7) * 7);
		}

		result = String(result);
		if (result[result.length - 1] === cardNumStr[cardNumStr.length - 1]) {
			return true;
		}
	}

	return false;
}

/* Loyalty Name [32675] */
function LoyaltyName(loyalty) { // loyalty === mnogoru || malina || kukuruza || perekrestok
	var lname = []; // loyalty name
	lname['mnogoru'] = __l('Много.ру');
	lname['malina'] = __l('МАЛИНА');
	lname['kukuruza'] = __l('Кукуруза');
	lname['perekrestok'] = __l('Перекресток');
	lname['tnt'] = __l('ТНТ-Клуб');
	lname['beeline'] = __l('Билайн');
	lname['rosneft'] = __l('«Семейная команда»');
	lname['bpclub'] = '«BP Club»';
	lname['aeroflot'] = __l('«Аэрофлот Бонус»');
	return lname[loyalty] ? lname[loyalty] : loyalty;
}

/* BEGIN New DatePicker Inputs [32714] */
BodyLoadFunc.push({'ext-input-date': function(){
	if ($('.ext-input-date').length) {
		$('.ext-input-date').each(function() {
			var T = $(this),
				inp = T.find('input');
			T.css({'cursor':'pointer'}).click(function() {
				var TT = $(this);
				inp.datepicker("show");
				$('#ui-datepicker-div').css({'left': TT.offset().left+TT.outerWidth()-$('#ui-datepicker-div').outerWidth()+'px', 'top': TT.offset().top+TT.outerHeight()+'px'});
			}).find('input').css({'display':'none'}).after('<span class="ui-date-number"></span>');
			inp.datepicker({
				numberOfMonths: 1,
				dateFormat:'yy-mm-dd'
			}).change(function() {
				var TT = $(this);
				var v_data=TT.val().split('-');
				TT.parent().find('.ui-date-number').html(parseInt(v_data[2], 10)+" "+RusMonth([v_data[1]-1])+ " "+ v_data[0]);
			}).change();
		});
	}
}});

/* END New DatePicker Inputs */

/* [36175] Скрипт для удобного ввода купонов  */
BodyLoadFunc.push({'autofill_code': function(){
	if ($('.autofill_code').length) {
		$('.autofill_code').keyup(function() {
			var code = this.value.split(' ').join('');
			if (/^(\d){4,16}$/.test(code)) {
				code = code.replace(/\d{4}/g, function(a,b,c) {
					return a + ' ';
				});
			}
			this.value = code.trim();
        });
		$('.autofill_code').keyup();
	}
}});
/* end [36175] Скрипт для удобного ввода купонов */

/* [36721] Переделать показ содержания на карточке книги на Ajax  */
BodyEndFunc.push({'show_book_title':function(){
	function noTOC() {
		$("#hg-content").removeClass('preload_toc').html("<div style='font-size: 12px; min-height: 20px'>" + __l('Оглавление недоступно') + "</div>");
	}
	$('#book_intro').click(function(){
		$("#hg-pop-tooltip").css({left:$('#book_intro').offset().left-55, top:$('#book_intro').offset().top+20});
		$('#hg-pop-tooltip, #hg-pop_close, #hg-overlay').show();
		$("#hg-content").addClass('preload_toc');
		GUJ.PutRequest({
			url: $('#spoiler_data').attr('data-url').replace(/dir\/.+/g, 'dir/h/toc.xml'),
			HttpRType: 'xml',
			OnData: function( data ) {
				var html = '';
				if (data === null) {
					noTOC();
					return false;
				}
				$('toc-item', data).each(function () {
					html += '<div style="margin-left:' + (20 * $(this).attr('deep')) + 'px;">' + $(this).text() + '</div>';
				});
				$("#hg-content").removeClass('preload_toc').html('<div id="spoiler_data">' + html + '</div>');
				return false;
			},
			OnDataFail: function () {
				noTOC();
				return false;
			}
		});
	});
}});
/* [36721] Переделать показ содержания на карточке книги на Ajax */

/*[37168] Блок про бонусные рубли на страницах пополнения счета*/

BodyEndFunc.push({'bonus_rubles_block': function(){
	if($("input[name='summ'].ext-input").length){
		check_val($("input[name='summ'].ext-input").val());
	}

	function check_val(val){
		if(val<=500){
			$('.put_money_more')
				.removeClass('green')
				.addClass('yellow')
				.find('span')
				.html(__l('<span>Пополните счет более чем на <a class="put_money_amount" href="#">500</a> руб. и получите 100 бонусных рублей в подарок.</span>'));
		} else if(val>500) {
			putMoneyMore();
		}
	}

	function putMoneyMore(){
		$('.put_money_more')
			.removeClass('yellow')
			.addClass('green')
			.find('span')
			.text(__l('Поздравляем! Вы получите 100 бонусных рублей в подарок.'));
	}

	$("input[name='summ'].ext-input").bind('keyup keypress blur change', function(){
		check_val($(this).val());
	});

	$('.put_money_amount').live('click', function(e){
		$("input[name='summ'].ext-input").val(501);
		putMoneyMore();
		e.preventDefault();
	});

}});

/*[37168] Блок про бонусные рубли на страницах пополнения счета*/


BodyEndFunc.push({'landing': function(){
	if ($('#click_pass_show').length) {
		$('#click_pass_show label').click(function(){
			$(this).parent().hide();
			$('.l_pass_show').show();
		});
		$('.with_ac').click(function(){
			$(this).parent().hide();
			$('.ext-input').addClass('no_check');
		});
	}

	var landing_check_txt = $('input[class=landing_check]').parent(),
		landing_check_button = landing_check_txt.parent().parent().find('button');
	if ($('input[class=landing_check]:not(":checked")').length) {
		landing_check_txt.css('color','red');
		landing_check_button.removeClass('btn-green-22').addClass('btn-gray-22');
	}

	landing_check_txt.click(function() {
		if ($('input[class=landing_check]:not(":checked")').length) {
			landing_check_txt.css('color','red');
			landing_check_button.removeClass('btn-green-22');
			landing_check_button.addClass('btn-gray-22');
		} else if ($('input[class=landing_check]:(":checked")').length) {
			landing_check_txt.css('color', 'inherit');
			landing_check_button.addClass('btn-green-22');
			landing_check_button.removeClass('btn-gray-22');
		}
	});

	// [123909] Доработка лендингов и запуск A-B теста
	var $landing = $('.b_landing');
	if ($landing.length) {
		$landing.find('#landing_button').on('click', function() {
			YaCounter('landing_button'); //Клик по Получить книгу/Получить подарок
		});

		$('.l_copyright_link').on('click', function(e) {
			e.preventDefault();
			ShowFrame('/pages/litres_oferta/',1);
			YaCounter('landing_offerta'); //Клик на «условия обслуживания»
		});

		$landing.find('.have_account').on('click', function() {
			YaCounter('landing_account'); //Клик на «У меня уже есть аккаунт на Литрес»
		});

		$landing.find('.create_pass').on('click', function() {
			YaCounter('landing_createpassword'); //Клик на «Придумать пароль самостоятельно»
		});
	}
}});

function landing_check(form, validate){
  var err_msg = '';
	if ($('input[class=landing_check]:not(":checked")').length) {
	 err_msg += landing_unchecked_msg;
	}
	if (form.find('[data-loyalty]').length) {
	  var loyalty = form.find('[data-loyalty]');
	  if (LoyaltyValidate(loyalty.attr('data-loyalty'), loyalty.val()) !== 1 && loyalty.attr('data-optional') == 0) err_msg += LoyaltyValidate(loyalty.attr('data-loyalty'), loyalty.val());
	}
	if (validate && err_msg) {
	  alert(err_msg);
	}
	return validate ? err_msg.length > 0 ? false : true : err_msg.length > 0 ? err_msg : 1;
}


function ValidateEmailForm () {
	the_form = document.getElementById('form_email_reg');
	err_msg = '';

	err_msg += ValidateMailField(the_form.new_login_mail);
	if(err_msg.length > 0) alert(err_msg);
	return err_msg.length > 0 ? false : true;
}

/* [36711] Попап с ребиллами на всех страницах litres.ru */
BodyLoadFunc.push({'RebillQuickPurchase': function(){
	if ($('#rebill-quick-purchase-bubble').length) {

		$("#rebill-quick-purchase-bubble").overlay({
			speed:100,
			mask: {color: '#000',loadSpeed: 200,opacity: 0.7},
			load:false,
			fixed:false
		});

		rebill.SubmitRebill = function(Service,ServiceID) {
			Summ = Math.ceil(rebill.price - rebill.amount);
			if ( !/^(\w+)$/.test(Service) || !/^\d+$/.test(Summ) || !/^\d+$/.test(ServiceID) ) return;
			$("#rebill-quick-purchase-bubble").overlay().close();
			var qRequest = {
				url: '/pages/ajax_empty2/',
				HttpRType: (Service == 'po') ? 'xml' : 'json',
				Method: 'post',
				OnData:function(Data) {
					if(Service == 'po') {
						rebill.ProcessPORebill(Data);
					} else if (Service == 'mr' && Data.status == 'ok' && Data.msg != '') {
						document.location.href=Data.msg;
					} else if (Data.status == 'ok' && Data.order > 0) {
						$('#waitorder-progress').overlay().load();
						Request_1.params.order_id=Data.order;
						SmsCheckTimeOut = setTimeout ('GUJ.PutRequest(Request_1)',5000);
					} else if (Data.status == 'error'){
						alert(Data.msg);
					} else {
						alert(__l('При выполнении заказа произошла ошибка'));
					}
					return;
				},
				params: {
					action: 'ajax_create_order',
					service: Service,
					service_id: ServiceID,
					summ: Summ,
					ref_url: rebill.ref_url,
					passphrase: rebill.passphrase,
					rand: Math.random()
				}
			};
			CSRF.sendRequest(qRequest);
			return;
		}

		rebill.ProcessPORebill = function(xml) {
			var paymentData = new Array();
			paymentData['url'] = $(xml).find("url").text();
			paymentData['method'] = $(xml).find("method").text();
			paymentData['order-id'] = $(xml).find("order-id").text();
			paymentData['params'] = new Array();
			$(xml).find("param").each(function() {
				paymentData['params'][$(this).attr("name")]=$(this).text();
			});
 			GUJ.PutRequest({url: paymentData['url'], Method: paymentData['method'], params: paymentData['params']});
			$('#waitorder-progress').overlay().load();
			Request_1.params.order_id=paymentData['order-id'];
			SmsCheckTimeOut = setTimeout ('GUJ.PutRequest(Request_1)',5000);
		}



		rebill.RebillQuickPurchase = function(o) {
			if (typeof o != 'object') return;
			$("#rebill-quick-purchase-bubble").overlay().load();
			$('#rebill-quick-purchase-bubble .buy_download_popup_text').html(
				(
					o.price > 0
					? __l('Купить и скачать {atype} {name} за {price} <span class="litres_ruble">{rub}</span>', {atype: TypeAffixes(o.atype), name: o.name, price: o.price, rub: '&#8381;'})
					: __l('Купить и скачать {atype} {name}', {atype: TypeAffixes(o.atype), name: o.name})
				) +
				'<p>' + __l('Воспользуйтесь своими привязанными счетами для моментальной оплаты<br>без повторного ввода данных.') + '</p>' +
				'<strong style="display:block;">' + __l('Оплата с моего счета или банковской карты:') + '</strong>'
			);
			rebill.ref_url = '/pages/my_books_fresh/?action=create_custom_set&arts='+o.id+'&redir='+encodeURIComponent('/pages/my_books_fresh/');
			rebill.price = o.price;
			return false;
		}
	}
}});

function TypeAffixes(mem) {
	var book_affix;
	switch (mem) {
		case 'text':
			book_affix = __l('электронную книгу');
			break;
		case 'readers':
			book_affix = __l('ридер');
			break;
		case 'audio':
			book_affix = __l('аудиокнигу');
			break;
		case 'hardcopy':
			book_affix = __l('бумажную книгу');
			break;
		case 'english':
			book_affix = __l('книгу на английском');
			break;
		default:
			book_affix = __l('книгу');
	}
	return book_affix;
}

/* end ajax vote scroll */

function loadDotDotDot(callback) {
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.async = true;
	script.src = '/static/jquery_plugs/dotdotdot/jquery.dotdotdot.min.js';
	script.onload = function () {
		callback();
	};
	document.body.appendChild(script);
}

/*[43884] metric and analytics */
function AnalyticsEvent(type, id){//unreg_open_page_book_1, unreg_push_buy_button_2, unreg_push_buy_logo_3, unreg_come_paid_4
	_gaq.push(['_trackEvent', type]);
	yaCounter2199583.reachGoal(type);
	//alert(type); //test for tester
	return true;
}

/* [47245] Сверстать блоки "четвертая книга в подарок" для маленькой корзины */
function CheckBookGift(books, type){
  if (type == 0 || type == 1 || type == 4) {
	var giftbook = $('#action_giftbook_header');
	if (giftbook.length) {
	  var giftbook_books = giftbook.find('.action_giftbook_books');
	  if (books) {
		giftbook.show();
	  } else {
		giftbook.hide();
	  }
	  giftbook.toggleClass('gift', (books > 2));
	  giftbook_books.text(3 - parseInt(books));
	  if (books < 3) {
		giftbook.find('.icon_book').each(function(index){
		  var self = $(this);
		  self.toggleClass('icon_book_basket',index < books);
		});
	  }
	}
  }
}

function simple_timer(sec, block) {
  var time = sec;
  var hours = Math.floor(time / 3600);
  time -= hours * 3600;
  var minutes = Math.floor(time / 60);
  time -= minutes * 60;
  block.innerHTML = hours+":"+(minutes < 10 ? '0'+minutes : minutes)+":"+(time < 10 ? '0'+time : time);
  sec--;
  if ( sec >= 0 ) {
	setTimeout(function(){ simple_timer(sec, block); }, 1000);
  }  else {
	location.reload(true);
  }
}

/* оплата paypal */
function PayPalInit(o){
  var progress = $('<div style="position:fixed;left:0;top:0;width:100%;height:100%;opacity:0.2;background:#000 url(/static/new/i/payment-progress.gif) center center no-repeat;z-index:99999;"></div>');
  $('body').append(progress);
  var Request = {
	url: '/pages/ajax_empty2/',
	Method: 'post',
	params: {
	  js: true,
	  descr: 69
	},
	HttpRType: 'json',
	OnData: function(data){
	  progress.remove();
	  if (data) {
		if (o.params.rebill && data.url) {
		  top.location.href = data.url;
		}
		if (data.token) {
		  //dg.startFlow('https://www.sandbox.paypal.com/incontext?token=EC-5B05061913748630E');
		  dg.startFlow('https://www.paypal.com/incontext?token=' + data.token);
        }
	  }

	},
	OnDataFail: function(fake1,fake2){
	  progress.remove();
	  alert(__l('Произошла ошибка. Платеж отклонен.'));
	}
  };
  $.extend(true, Request, o);
  CSRF.sendRequest(Request);
  return false;
}

function initPayPal() {
	loadCheckoutJs();
}

 // [98512] Подключить новый протокол PayPal к оплатам на www/pda
 // REST Express Checkout
 // https://github.com/paypal/paypal-checkout/blob/master/docs/button.md
 function initPayPalRest() {
 	var payPalButtonSelector = '#paypal-rest-button';
 	var $container = $('#putmoney');
 	if ($container.find(payPalButtonSelector + ' .paypal-button').length || !$(payPalButtonSelector).length) {
 		return;
 	}
 	if ($container.find('.rebill').length) {
 		$container = $(payPalButtonSelector);
 	}
 	$container.addClass('loading');

 	loadCheckoutJs(renderPayPalButton);

 	function renderPayPalButton() {
 		paypal.Button.render({
 		    env: 'production', // sandbox/production
 		    style: {
 		        size: 'responsive',
 		        shape: 'rect',
 		        tagline: false,
 		        color: 'blue',
 		       	label: 'pay'
 		    },
            locale: getLangForPaypal(),
 		    // payment() is called when the button is clicked
 		    payment: function(data, actions) {
 		    	var custom_set = $('#payment-form').find('input[name=custom_set]').val();
 		        var params = {
 		            js: true,
 		            descr: 69,
 		            buy_now: true,
 		            save: $('#paypal_save').is(':checked'), // сохранить карту?
 		            summ: $('#GMCountCell').val(),
 		            json: true
 		        };
 		        if (custom_set) {
	            	params.custom_set = custom_set;
	            }

 		        return actions.request.post('/pages/proceed_payment/', params)
 		            .then(function(res) {
 		                return res.token;
 		            });
 		    },
 		    // onAuthorize() is called when the buyer approves the payment
 		    onAuthorize: function(data, actions) {
 		        data.json = true;
 		        return actions.request.post(data.returnUrl, data)
 		            .then(function(execute_data) {
 		                if (execute_data.status == 1) {
 		                    window.location = execute_data.ref_url;
 		                } else {
 		                    window.alert(__l('Ошибка проведения платежа'));
 		                }
 		            });
 		    }
 		}, payPalButtonSelector);
 		$container.removeClass('loading');
 	}
 }

 function getLangForPaypal() {
     // https://developer.paypal.com/docs/integration/direct/rest/locale-codes/#supported-locale-codes
     var langs = {
         ru: 'ru_RU',
         pl: 'pl_PL',
         en: 'en_US',
         es: 'es_ES',
         et: 'en_US',
         de: 'de_DE'
     };

     if (langs[litres.uilang.toLowerCase()]) {
         return langs[litres.uilang.toLowerCase()];
     }
     return langs.ru;
 }

 function loadCheckoutJs(callback) {
    litres.loadJs('/static/ds/paypal/checkout.min.js', callback);
 }

 $(function() {
 	if (window.paypalCheckoutMode) {
		initPayPalRest();
 	}
 });

/* [61924] Создать в Яндекс.Метрике составную цель для регистрации */
jQuery(document).on('yacounter2199583inited', function(){ // если иницилизирован счетчик
	if(litres_user_id == 0){
		$('#bell_reg_click').on('click', function () {
			yaCounter2199583.reachGoal('bell_registration');
		});

		$('.read-comfortably').on('click',function(){
			yaCounter2199583.reachGoal('read-comfortably');
		});

		/*
		$('.span_read_preview_link').on('click',function(){
			yaCounter2199583.reachGoal('read-fragment',function(){console.log('read-fragment')});
		});
		*/
		$('.login-page_registration').on('click',function(){
			yaCounter2199583.reachGoal('login-page_registration');
		});

		$(".online_reading_pager a").live('click',function(){
			yaCounter2199583.reachGoal('read-online_pagination');
		});

		// [123909] Доработка лендингов и запуск A-B теста
		var $landing = $('.b_landing');
		if ($landing.length) {
			if ($landing.find('input[name="code1"]').length) {
				YaCounter('landing_view_coupone'); //Событие пользователь увидел лендинг с вводом купона
			} else {
				YaCounter('landing_view_nocoupone'); //Событие пользователь увидел лендинг с вшитым купоном
			}
		}
	}

	/* [92844] */
	$('#header-avatar-icon').on('click', function () {
		yaCounter2199583.reachGoal('ClickToMyProfile');
	});

	/* [99540] */
	for (var tests in litres.tests){
		if(litres.tests[tests] == 'test' || litres.tests[tests] == 'control'){
			yaCounter2199583.params({ab_test: tests+'_AB_'+litres.tests[tests]});
		}
	}

	// [102576] Передавать параметры пользователя в Метрику
	(function() {
		var obj = {
			logged: !!litres.user
		};
		if (litres.user) {
			obj.ID = litres.user;
		}
		yaCounter2199583.userParams(obj);
	})();

});
function yaLogin_registration(){
	yaCounter2199583.reachGoal('login_registration');
}
/* [68125] */
BodyEndFunc.push({'read_book_similar': function(){
	if($('#book-similar').length){
		$('#book-similar').addClass('book-similar_small').on('click', function(){
			$(this).removeClass('book-similar_small');
		});
	}
}});
function LastViewed(artID){
	var data = getCookie("last_viewed");
	var dataArr = new Array();
	var MaxQueueLen = 30;
	if(data) {
		dataArr = data.split(',');
		if(dataArr.indexOf(artID+"")!=-1) return;
	}
	dataArr.push(artID);
	if(dataArr.length > MaxQueueLen){
		dataArr.splice(0,1);
	}
	setCookie("last_viewed",dataArr,6,"/");
}

BodyEndFunc.push({'web_push_popup': function(){
	$("#web-push .web-push-close").on("click", function () {
		$("#web-push").hide();
	});
}});

/* Шаблон оформление цены в вид  0,00 */
function formatPriceNumber(price) {
	var _price = price * 1;
	if (Math.round(_price) !== _price) {
		parseFloat(_price);
		_price += '';
		_price = _price.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
		return _price.replace('.', ',');
	} else {
		return parseInt(_price);
	}
}

BodyEndFunc.push({'pobeda_landing': function () {
	if ($('.pobeda_collection_page').length) {
		$('#activate_button').on('click', function (e) {
			if (!$('#code1').val().length) {
				e.preventDefault();
				alert(__l('Вы не ввели код купона'));
			}
		});
		$('.free_get_now').on('click', function (e) {
			e.preventDefault();
			CSRF.sendRequest({
				url: '/pages/ajax_epmty/',
				Method: 'post',
				params: {
					action: 'decr_user_gifts',
					art: $(this).closest('.book_right_info').find('.book_id').attr('data-id'),
					no_redirect: 1
				},
				OnData: function (Data) {
					if (Data == 'ok') {
						window.location.reload();
					} else {
						alert(Data);
					}
				}
			});
		});
	}
}});
/* [85538] */
BodyEndFunc.push({'ya_metrika': function () {
	window.dataLayer = window.dataLayer || [];
	$('.basket-table .icon_delete').on('click', function () {
		var $attrs = $(this).prev();
		dataLayer.push({
			"ecommerce": {
				"currencyCode": "RUB",
				"remove": {
					"products": [
						{
							"id": $attrs.attr('data-id'),
							"name": $attrs.attr('data-name')
						}
					]
				}
			}
		});
	});
	$('.push_to_basket_btn').on('click', function () {
		var self = $(this);
		dataLayer.push({
			"ecommerce": {
				"currencyCode": "RUB",
				"add": {
					"products": [
						{
							"id": self.attr('data-id'),
							"name": self.attr('data-name'),
							"price": self.attr('data-price'),
							"quantity": 1
						}
					]
				}
			}
		});
	});
	$('.ab-popup').on('click', '.del_item_btn', function () {
		var self = $(this);
		dataLayer.push({
			"ecommerce": {
				"currencyCode": "RUB",
				"remove": {
					"products": [
						{
							"id": self.attr('data-id'),
							"name": self.attr('data-name'),
							"quantity": 1
						}
					]
				}
			}
		});
	});
	$('#clean-basket').on('click', function () {
		var $books = $('.basket-table:first input[name="attrs"]');
		var books = [];
		$books.each(function(indx, element){
			books.push({
				"id": $(element).attr('data-id'),
				"name": $(element).attr('data-name'),
				"quantity": 1
			});
		});
		dataLayer.push({
			"ecommerce": {
				"currencyCode": "RUB",
				"remove": {
					"products": books
				}
			}
		});
	});
}});

/* [81003] Новая шапка ЛитРес */
BodyEndFunc.push({'NewHeader': function () {
	/* header */
	var $header = $('#litres_header');
	var init = false;
	var previousScroll = 0;
	var spamTicketsCount = $('#header-info-link').attr('data-msg-count') || 0;

	if (!litres.user) {
		updateMyBooksSticker();
	} else {
		resetMyBooksStickerCookies();
	}

	function toggleHeader() {
		var scrollTop = $(document).scrollTop();
		var downScroll = scrollTop > previousScroll;
		var upScroll = scrollTop < previousScroll;
		var $genresel = $('[data-header_open="genres"].active');
		var $genrespopup = $('[data-header_popup="genres"]');

		if (scrollTop > 15) {
			$header.css('top', 0);
			$header.addClass('litres_header_slim');
			if (litres.discountBanner) { $header.removeClass('page-wrap-with_header_banner'); }
			init = true;

			if (init && downScroll) {
				$header.addClass('litres_header_slim');
				if (litres.discountBanner) { $header.removeClass('page-wrap-with_header_banner'); }
			}
			if (upScroll) {
				$header.removeClass('litres_header_slim');
				init = false;
			}
		} else {
			if (downScroll) {
				var top = '-' + scrollTop + 'px';
				$header.css('top', top);
				$header.removeClass('litres_header_slim');
				init = false;
			}
			if (scrollTop === 0) {
				$header.css('top', 0);
				$header.removeClass('litres_header_slim');
				if (litres.discountBanner) { $header.addClass('page-wrap-with_header_banner'); }
				init = false;
			}
		}

		if ($genresel.length) {
			setGenresPopupPos($genrespopup, scrollTop, downScroll, upScroll);
		} else {
			setPopupPos();
		}
		previousScroll = scrollTop;
	}

	function сhangeSearchPlaceholder() {
		var $q = $('#q');
		if ($(window).width() <= 1024) {
			$q.attr('placeholder', __l('Название книги или имя автора'));
		} else {
			$q.attr('placeholder', __l('Введите название книги или имя автора'));
		}
		if ($q.width() <= 250) {
			$q.attr('placeholder', __l('Книга или автор'));
		}
	}

	/* header popups */
	function getCoordsPopup($el, $popup) {
		var popupTag = $el.attr('data-header_open');
		var $main_block = $header.find('.header_main');
		// элемент, по которому центрируем
		var $focus = $el.find('.header_popup_focus').length ? $el.find('.header_popup_focus') : $el;
		var popup_left;
		if (popupTag === 'my_books') {
			popup_left = $focus.offset().left +$focus.width() - $popup.width();
		} else {
			popup_left = $focus.offset().left - $popup.width() / 2 + $focus.width() / 2;
		}
		var coords = popup_left;
		// если попап вылазит за границы шапки, фиксируем его по правому краю шапки
		if (popup_left + $popup.width() > $main_block.width() + $main_block.offset().left) {
			coords = ($main_block.width() - $popup.width()) + $main_block.offset().left + parseInt($main_block.css('padding-left'));
		}
		return coords;
	}

	function setPopupPos($el, $popup) {
		if (!$el && !$popup) {
			$el = $('[data-header_open].active');
			$popup = $('[data-header_popup="' + $el.attr('data-header_open') + '"]');
			if (!$el.length && !$popup.length) {
				return;
			}
		}
		var popup_data = $el.attr('data-header_open');
		var is_menu_popup = $el.closest('.header_menu').length ? true : false;
		var popup_left = getCoordsPopup($el, $popup);
		var popup_top = (is_menu_popup ? $header.height() - 10 : $header.height() - 50);

		$popup.css({ left: popup_left + 'px' }).addClass('header-popup_open');
		$popup.css({ top: ($header.hasClass('litres_header_slim') ? $header.height() : popup_top) + 'px' });

		if (!(litres.newLogin && $el.attr('data-header_open') == 'login')) {
			setPopupArrow($el, $popup);
		}
	}

	function setGenresPopupPos($popup, scrollTop, downScroll, upScroll) {
		var isClosePopup = downScroll && $popup.height() + $popup.offset().top - $header.height() - 10 < scrollTop;
		var isScrollUpPopup = upScroll && $popup.offset().top - $header.height() - 10 <= scrollTop;
		var isScrollDownPopup = downScroll && $popup.offset().top - $header.height() - 10 > scrollTop;

		$popup.css({ left: '30px' }).addClass('header-popup_open');
		if (isScrollUpPopup) {
			$popup.css({ top: $header.height() - 10 + 'px', position: 'fixed' });
		} else if (isScrollDownPopup) {
			$popup.css({ top: $header.height() - 10 + scrollTop + 'px', position: 'absolute' });
		}

		if (isClosePopup) {
			$popup.data('overlay').close();
		}
	}

	// TODO: При необходиомсти добавить в проверку еще условий. Например, .ab-popup_left-arrow
	function hasFixedPopupArrow($popup) {
		return $popup.hasClass('header-popup_right-arrow');
	}

	function setPopupArrow($el, $popup) {
		// элемент, по которому центрируем
		var $focus = $el.find('.header_popup_focus').length ? $el.find('.header_popup_focus') : $el;
		var $arrow = $popup.find('.header-popup__arrow');
		if (!$arrow.length) {
			$arrow = $('<div class="header-popup__arrow"></div>');
			$popup.append($arrow);
		}
		arrowWidth = Number($arrow.width());
		if (!hasFixedPopupArrow($popup)) {
			$arrow.css({ left: $focus.offset().left + $focus.width() / 2 - $popup.offset().left - (arrowWidth / 2) + 'px' });
		}
	}

	function initHeaderPopups() {
		var menu_div = $('[data-header_open]');

		function hasHoverElement($self) {
			return $self.find('.' + $self.attr('data-hover_zone_class')).length ? true : false;
		}

		menu_div.each(function (i, element) {
			var $self = $(element);
			var options = {
				popup: $self.attr('data-header_open')
			}
			if ($self.attr('data-header_open') == 'login' && litres.newLogin) {
				options.mask = {
					color: '#000',
					loadSpeed: 200,
					opacity: 0.6
				};
			}
			createPopupOverlay(options);
		});

		menu_div.on('click', function (e) {
			e.preventDefault();
			e.stopPropagation();

			var $self = $(this);
			var popup_attr = $self.attr('data-header_open');
			var $popup = $('[data-header_popup="' + popup_attr + '"]');

			if (!$popup.length) {
				return;
			}

			var $target = $(e.target);
			if (hasHoverElement($self) && $target.hasClass($self.attr('data-hover_zone_class'))) {
				var $link = $self.find('a');
				window.location.href = $link.attr('href');
				return;
			}

			getPopupOverlay($popup);

			if (litres.newLogin && !litres.user && popup_attr === 'login') {
				var $input = ($popup.find('.phone-select__input').length ? $popup.find('.phone-select__input') : $popup.find('.login-popup__input.input_text'));
				$input.focus();
			}
		});

		$('body').on('click', function (e) {
			if (!$(e.target).closest('.header-popup').length) {
				menu_div.each(function (i, element) {
					$('[data-header_popup="' + $(element).attr('data-header_open') + '"]').data('overlay').close();
				});
			}
		});
	}

	function createPopupOverlay(options) {
		var $el = options.el || $('[data-header_open="' + options.popup + '"]');
		var $popup = $('[data-header_popup="' + options.popup + '"]');
		var is_menu_popup = $el.closest('.header_menu').length ? true : false;
		var popup_top = 0;
		var mask = options.mask ? options.mask : false;

		$popup.overlay({
			fixed: (options.popup === 'genres' ? false : true),
			speed: 0,
			mask: mask,
			onClose: function () {
				$el.removeClass('active');

				if (litres.newLogin && litres.phone && options.popup === 'login' && typeof headerLogin !== 'undefined' && headerLogin.getActiveStepName() === 'verifyBySMS') {
					sendClicktag('Closenumbnewtel');
				}
			},
			onLoad: function () {
				popup_top = (is_menu_popup ? ($header.height() - 10) : $header.height() - 50);

				if (options.popup === 'genres') {
					$popup.css({
						'top': ($header.hasClass('litres_header_slim') ? $header.height() : popup_top) + $(window).scrollTop() + 'px',
						'left': 30
					});
				} else {
					$popup.css({
						'top': ($header.hasClass('litres_header_slim') ? $header.height() : popup_top) + 'px',
						'left': getCoordsPopup($el, $popup)
					});
					if (!(litres.newLogin && options.popup == 'login')) {
						setTimeout(function () {
							setPopupArrow($el, $popup);
						}, 100);
					}
				}
				$popup.addClass('header-popup_open');
				$el.addClass('active');
				if (!litres.user && options.popup == 'login') {
					launchSocNet();
				}

				if (litres.newLogin && !litres.user && options.popup === 'login') {
					sendClicktag('newlogin');
				}
			}
		});
	}

	function getPopupOverlay(query) {
		if (query.length) {
			if (query.data("overlay").isOpened()) {
				query.data("overlay").close();
			} else {
				query.data("overlay").load();
			}
		}
	}

	function getGenresPopup() {
		var genresBubble = '/static/ds/newgenres_bubble/' + litres.libface + '/index.html', $genreHover = $('[data-header_open="genres"] > ul');
		genresBubble = genresBubble + (/\?/.test(genresBubble) ? '&amp;' : '?') + 1;
		$.get(genresBubble, function(data) {
			var $genreLinks = $('.bubble_genres');
			$genreLinks.html(data);
			if (litres.lib_mode == 0) {
				$genreLinks.append('<div class="bubble_genre"><h2 class="bubble_head"><a href="/tags/samizdat/">' + __l('Самиздат') + '</a></h2></div>');
			}
			var genreNum = 1;
			$('.bubble_genre').each(function() {
				var t = $(this), genresMore = t.find('.genres_more');
				genreNum += genresMore.length ? parseInt(genresMore.text().substr(genresMore.text().search(/\d/))) : t.find('li').length;
			});
			$('.bubble_allgenres a').text(__ln('Все {count} жанр', 'Все {count} жанров', genreNum, { count: genreNum }));
			$('.subgenre_bubble_list').css('height', $genreLinks.height() - 24);
			$("#genres_popup").click(function() {
				$genreLinks.show();
				$('.bubble_subgenres, .bubble_back').hide();
				if (typeof yaCounter2199583 !== 'undefined') {
					yaCounter2199583.reachGoal('ClickToGenres');
				}
			});
			$('.bubble_back').on('click', function() {
				prev_genres.pop();
				if (prev_genres.length == 0) {
					$('.bubble_subgenres, .bubble_back').hide();
					$('.bubble_genres').show();
				} else {
					MoreGenres(prev_genres[prev_genres.length - 1], true);
				}
			});
		});
		$genreHover.remove();
	}

	if ($header.length) {
		$('.header_nav [data-header_open="menu-more"] > ul').remove();

		/* [108519] */
		var $landingForm = $('#corn_regform');
		if (!litres.user && $landingForm.length) {
			var LandingLoginForm = new LoginForm.LoginFormClass({
				form: $landingForm,
				email: $landingForm.find('input[name=new_login]'),
				pass: $landingForm.find('input[name=new_pwd_open]'),
				landing: true,
				cssClass: 'b_landing',
				addEvents: function () {
					$('#popup-b_landing__eye').on('click', function () {
						LandingLoginForm.pass[0].type = (LandingLoginForm.pass[0].type === 'password') ? 'text' : 'password';
						return false;
					});

					$('#click_pass_show').on('click', function () {
						LandingLoginForm.config.isAutoPwd = false;
						return false;
					});
				}
			});
		}

		if (!litres.user && !litres.newLogin) {
			var headerLoginForm = new LoginForm.LoginFormClass({
				form: $('#popup-login__form'),
				cssClass: 'popup-login',
				addEvents: function () {
					$('.popup-login__terms-link').on('click', function () {
						ShowFrame('/pages/litres_oferta/', 1);
						return false;
					});

					$('#popup-login__eye').on('click', function () {
						headerLoginForm.pass[0].type = (headerLoginForm.pass[0].type === 'password') ? 'text' : 'password';
						return false;
					});

					$('#popup-login__header-link').on('click', function () {
						headerLoginForm.setStateForm('login');
						return false;
					});

					$('#popup-login__details_link').on('click', function () {
						headerLoginForm.form.isAutoPwd = false;
						headerLoginForm.openPassword();
						return false;
					});

					/* social networks */
					$('#header_vkontakte_login').on('click', function (e) {
						e.preventDefault();
						VKLoginClick(4259842);
					});
					$('#header_facebook_login').on('click', function (e) {
						e.preventDefault();
						FBLoginClick('email,user_friends,user_gender,user_birthday');
					});
					$('#header_ok_login').on('click', function (e) {
						e.preventDefault();
						OKLoginClick('1247812096');
					});
					$('#header_twitter_login').on('click', function (e) {
						e.preventDefault();
						TWLoginClick();
					});
					$('#header_mailru_login').on('click', function (e) {
						e.preventDefault();
						MRLoginClick();
					});
					$('#header_yandex_login').on('click', function (e) {
						e.preventDefault();
						YaLoginClick();
					});
				}
			});

			$('#bell_reg_click').on('click', function () {
				$('[data-header_popup="login"]').data('overlay').load();
				headerLoginForm.setStateForm('registration');
				return false;
			});
			$('#popup-info__links-enter').on('click', function () {
				$('[data-header_popup="login"]').data('overlay').load();
				headerLoginForm.setStateForm('login');
				return false;
			});

			$('.social-buttons__button-more-link').on('click', function () {
				$(this).toggleClass('social-buttons__button-more-link_active');
				$('.social-buttons__button-more').toggleClass('social-buttons__button-more_active');
			});
		}

		// [116303] Новая форма логина из шапки
		if (litres.newLogin) {
			var popupAfterAuth = getCookie('popup_after_auth');
			var askingPopup = getCookie('popup_asking');
			var $loginPopup = $('[data-header_popup="login"]');

			if (!litres.user || popupAfterAuth || askingPopup) {
				window.addEventListener('load', function () {
					window.headerLogin = new LoginPopup(function () {
						this.disableBiblioFooter = litres.uilang == 'ru' ? false : true; // скрываем библиотечную авторизацию для нерусских фейсов
						if ((litres.askingPopup && askingPopup) || popupAfterAuth || askingPopup == 'socnetAttach') {
							createPopupOverlay({
								popup: 'login',
								el: $('.user-logo-wrapper'),
								mask: {
									color: '#000',
									loadSpeed: 200,
									opacity: 0.6
								}
							});

							$loginPopup.data('overlay').load();
						}
					});
				});
			}

			$('#bell_reg_click, #popup-info__links-enter').on('click', function (e) {
				e.preventDefault();
				$('[data-header_popup="login"]').data('overlay').load();
			});

			$('body').on('click', '#exposeMask', function (event) {
				if ($loginPopup.hasClass('header-popup_open')) {
					sendClicktag('close2newlogin', event);
				}
			});
			$('body').on('click', '.header-popup_open .close', function (event) {
				sendClicktag('closenewlogin', event);
			});
		}

		initHeaderPopups();

		$(window).on('resize', function () {
			setTimeout(function () {
				сhangeSearchPlaceholder();
			}, 200);
			setPopupPos();
		});
		сhangeSearchPlaceholder();

		$(window).on('scroll', toggleHeader);

		/* [102974]  */
		getGenresPopup();
		$('.header_popup_link[data-header_open="library"]').removeClass('disabled');

		if (litres.isNewPayment || litres.isNewPaymentBilling) {
			$('#popup-user__cash-button__button').on('click', function() {
				return Payment.open({
					ref_url: litres.ref_url
				});
			});
		}

		/* [108279] A/B тест для оценки влияния раздела: Литрес Чтец на другие элементы главного меню. */
		$('.header_menu_item a').on('click', function () {
			var $this = $(this), $li = $this.parent(), $goal = $li.attr('data-goal');
			if($goal){
				if (typeof yaCounter2199583 !== 'undefined') {
					yaCounter2199583.reachGoal($goal);
				}
			}
		});
	}
}});

function showPopupError(params) {
	var params = params || {};
	if (litres.newLogin) {
		if (params.html) {
			headerLogin.showFailError(params.html);
		}
		$(document).mask({
			color: '#000',
			loadSpeed: 200,
			opacity: 0.4,
			onClose: function () {
				headerLogin.showFirstStep();
			},
			onLoad: function () {
				$('[data-header_popup="login"]').data('overlay').load();
			}
		});
	} else {
		/* [102803] Перенести показ причины вызова попапа в самое начало, подправить тексты */
		var $failblock = $('#popup-login__action-error-block');
		var $popup = $('[data-header_popup="login"]');
		if (params.ref_url) {
			$popup.find('#ref_url').attr('value', params.ref_url);
		}
		if (!($popup && $popup.data('overlay'))) {
			BodyEndFunc.push({'NewHeader_2': function () {
				showPopupError(params);
			}});
			return;
		}
		$(document).mask({
			color: '#000',
			loadSpeed: 200,
			opacity: 0.4,
			onClose: function () {
				$failblock.hide();
			},
			onLoad: function () {
				$popup.data('overlay').load();
			}
		});
		if (params.html) {
			$failblock.html(params.html).show();
		}
	}
	return false;
}

BodyEndFunc.push({'z_asking_email': function () {
	if ($('#main-div').length && $('#main-div').attr('data-asking-email') == 1) {
		var temp_mail = '';
		var loginScript = document.createElement('script');
		loginScript.type = 'text/javascript';
		loginScript.async = true;
		loginScript.src = window.location.origin + '/static/new/modules/login/js/login.js';
		loginScript.onload = askingEmail;
		document.body.appendChild(loginScript);

		function askingEmail() {
			var askingMailForm = new LoginForm.LoginFormClass({
				form: $('.asking-email__form'),
				usage: 'asking-email',
				custom_set: $('.asking-email__form').attr('data-custom-set'),
				cssClass: 'asking-email',
				addEvents: function () {
					$('#asking-email__eye').on('click', function () {
						askingMailForm.pass[0].type = (askingMailForm.pass[0].type === 'password') ? 'text' : 'password';
						return false;
					});
				}
			});

			if (litres_user_id != 0) {
				askingMailForm.form.attr('data-action', 'update-mail');
			} else {
				askingMailForm.form.attr('data-action', 'create-stat-user');
			}

			askingMailForm.form.find('input[name=ref_url]').val(window.location.pathname +
				window.location.search);

			askingMailForm.resetForm = function () {
				askingMailForm.form.attr({
					'data-state': 'registration',
					'data-action': litres_user_id != 0 ? 'update-mail' : 'create-stat-user'
				});
			};

			askingMailForm.merge2Users = function () {
				var self = this;
				self.form.find('.asking-email__input-password')
					.before('<div class="asking-email__merge">' + makeMergeBlock() + '</div>');

				self.form.find('.asking-email__input_wrapper:not(.asking-email__input-password)').hide();
				self.form.find('.asking-email__text').hide();
				self.form.attr('data-action', 'merge-users');

				function makeMergeBlock() {
					return '<div class="asking-email__merge-text">' +
						__l('Выберите основной аккаунт, который Вы бы хотели оставить. Все купленные книги со второго аккаунта и баланс счета переедут на него:') + '</div>' +
						'<ul class="asking-email__merge-users">' +
						//makeLiWithLogin('login', litres.name, true) +
						makeLiWithLogin('second', self.email.val(), false) +
						'</ul>' +
						'<div class="asking-email__merge-text">' + __l('Для подтверждения объединения введите пароль') + ' <strong>' +
						self.email.val() + '</div>';
				}

				function makeLiWithLogin(id, login, checked) {
					return '<li>' +
						'<input type="radio" name="merge-item" class="asking-email__merge-item" value="' + login + '" ' +
						'id="' + id + '"' + (checked ? ' checked="checked"' : '') + ' />' +
						'<label class="but_unite" for="' + id + '">' +
						login + (id == 'login' ? ' <span>' + __l('(текущий аккаунт)') + '</span>' : '') +
						'</label>' +
						'</li>';
				}
			};

			askingMailForm.email.on('keyup focusout input', function () {
				if (temp_mail !== askingMailForm.email.val()) {
					askingMailForm.resetForm();
				}
			});

			$('.webmoney_standart_button').on('click', function (e) {
				e.preventDefault();
				e.stopPropagation();
				var $this = $(this);
				$('.putmoney_webmoney .putmoney').hide();
				$('.putmoney_webmoney .asking-email').show();
				askingMailForm.form.find('input[name=ref_url]').val('');
				askingMailForm.config.submitCallback = function () {
					$this.closest('form').submit();
				};
			});

			askingMailForm.form.find('.asking-email__button').on('click', function () {
				temp_mail = askingMailForm.email.val();
			});

			askingMailForm.form.find('.asking-email__change_link').on('click', function (e) {
				e.preventDefault();
				askingMailForm.clearInputs();
				askingMailForm.resetForm();
				askingMailForm.email.focus();
			});
		}
	}
}});

/* [96783] POPUP Анкета – опросник для веба */
BodyEndFunc.push({'z_question_overlay': function () {
	if(ABTests.test235=='test'){
		/* Проверка куки */
		var qovPopup=getCookie('qovPopup');
		if (qovPopup != 1){
			setTimeout(function(){
				var $body = $('body'), FrameUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdz87nRSUqQMJSRTHywAY_PHzFMcSzjin86W-UqISz9bZImGA/viewform?embedded=true', timer = false;
				$body.addClass('noscroll').append('<div class="question-overlay" id="question-overlay"><div class="question-wrapper"><a id="qv-close">'+__l("Закрыть")+'</a><iframe class="question-iframe" src="'+FrameUrl+'"></iframe></div></div>');

				setCookie('qovPopup', '1',30,'/');

				YaCounter('show_popup_anketa_statluche');

				setTimeout(function() {
				  timer = true;
				}, 10000);

				$('#qv-close').on('click',function(){
					$('#question-overlay').hide();
					$body.removeClass('noscroll');

					if(timer == true){
						YaCounter('closed_more_10_sek_popup_anketa_statluche');
					}else{
						YaCounter('closed_less_10_sek_popup_anketa_statluche');
					}
				});
			}, 10000);
		}
	}

	/* [98360] Очередная Анкета – опросник с подарком для WWW */
	if(ABTests.test242=='test'){
		var slPopup=getCookie('slPopup');
		if (slPopup != 1){
			setTimeout(function(){
				var $body = $('body');
				$body.addClass('noscroll').append('<div class="survey__litr-overlay" id="survey__litr-overlay">'
				+'	<div class="survey__litr-wrapper">'
				+'		<a id="sl-close"></a>'
				+'		<div class="h1">' + __l('Помогите ЛитРес стать лучше!') + '</div>'
				+'		<div class="sl-title">'
				+			__l('Пройдите опрос* и получите<br/><span class="uppercase">книгу в подарок</span>')
				+'		</div>'
				+'		<div class="sl-btn-orange" id="sl-btn-orange"><a href="https://docs.google.com/forms/d/e/1FAIpQLSdBbz5PTjGybq_FG99gI636D9YDgpAiDBF9W4zPSwPi8jmP6Q/viewform" target="_blank">' + __l('Пройти опрос') + '</a></div>'
				+'		<div class="sl-time">' + __l('*опрос займет 7-8 минут') + '</div>'
				+'	</div>'
				+'</div>');

				setCookie('slPopup', '1',30,'/');

				YaCounter('show_popup_for_biggoogleform_bookgift');

				$('#sl-close').on('click',function(){
					$('#survey__litr-overlay').hide();
					$body.removeClass('noscroll');
				});

				$('#sl-btn-orange').on('click',function(){
					YaCounter('click_link_popup_for_biggoogleform_bookgift');
				});
			}, 10000);
		}
	}
}});

/* [95980] Верстка и подключение клянчилки мерджа после клянчилки емейлов */
BodyEndFunc.push({'z_popup-merge-users': function () {
	$(function() {
		var cookieForMerge = getCookie('user_mail_merge');
		if (getCookie('just_bought') && cookieForMerge && cookieForMerge == litres_user_id) {
			loadPopupCss();
			loadPopupHTML();
		}

		function loadPopupCss() {
			$('head').append('<link rel="stylesheet" href="/static/new/css/p/popup-merge-users.css" type="text/css">');
		}

		function loadPopupHTML() {
			var popup = '/static/litres/inc/ru/popup-merge-users.html';
			$.get(popup, function(data) {
				$('body').append(data);
				createPopup();
			});
		}

		function createPopup() {
			var $popup = $('#popup-merge-users');

			$popup.overlay({
				load: false,
				speed: 100,
				mask: {
					color: '#000',
					loadSpeed: 200,
					opacity: 0.7
				},
				onLoad: function () {
					YaCounter('MergePopupShow');
				},
				onClose: function () {
					$.mask.close();
				},
				left: '50%',
				fixed: false,
				noscroll: true
			});

			$popup.find('#popup-merge-users__user-mail').attr('href', litres.email).text(litres.email);
			$popup.data('overlay').load();
			setCookie('user_mail_merge', '', -1, '/');

			$popup.find('#popup-merge-users__button').on('click', function () {
				CSRF.sendRequest({
					url: '/pages/ajax_empty2/',
					Method: 'POST',
					params: {
						action: 'unite_users',
						id: 'all'
					},
					OnData: function (data) {
						$popup.find('.popup-merge-users__button-block').hide();
						$popup.find('.popup-merge-users__mail-block').show();
					},
					OnDataFail: function (data) {
						console.error(__l('Ошибка'), data);
					}
				});
				YaCounter('MergePopupConfirm');
			});
		}
	});

	/* [114095] Запуск Книги дня – баннер на всех страницах */
	$('#banner__freedailybook_close').on('click', function (e) {
		e.preventDefault();
		$('#banner__freedailybook, #banner__freedailybook_close').hide();
		setCookie('FreedailybookBanner', '1', 3,'/');
	});
	/* [124507] Верстка баннеров подписным юзерам */
	$('#banner__megafon_close').on('click', function (e) {
		e.preventDefault();
		$('#banner__megafon, #banner__megafon_close').hide();
		setCookie('bannerMegafon', '1', 7,'/');
	});
	/* [138808] Новогодний баннер вместо Книги дня */
	$('#banner__newyear_gift_close').on('click', function (e) {
		e.preventDefault();
		$('#banner__newyear_gift, #banner__newyear_gift_close').hide();
		setCookie('NewyearGiftBanner', '1', 3,'/');
	});

}});

function YaCounter(event){
	if(typeof yaCounter2199583 !== 'undefined'){
		yaCounter2199583.reachGoal(event);
	}
}

/* [97972] Новый баббл с новыми жанрами */
var prev_genres = [];

function MoreGenres(genre, prev) {
	var genresBubble = '/static/ds/newgenres_bubble/' + litres.libface + '/' + genre + '.html',
		genres = $('.bubble_genres'), subgenres = $('.bubble_subgenres');
	genresBubble = genresBubble + (/\?/.test(genresBubble) ? '&amp;' : '?') + 1;
	$.get(genresBubble, function(data) {
		subgenres.html(data).show();
		$('.subgenre_bubble_list li a:first-child, .subgenre_bubble_head').each(function() {
			var t = $(this);
			t.text(t.text().substr(0, 1).toUpperCase() + t.text().substr(1));
		});
		$('.bubble_back').show();
		if (!prev) {
			prev_genres.push(genre);
		}
		var sg_list = $('.subgenre_bubble_list').find('li'), container = $('.subgenre_bubble_list_wrapper'),
			sg_height = genres.height() - 71, total_height = 0;
		container.css('height', sg_height);
		sg_list.each(function(i) {
			var t = $(this), height = t.height();
			if (total_height + height >= sg_height || i == sg_list.length - 1) {
				$('<ul class="subgenre_bubble_list">').append(t.prevAll().andSelf()).appendTo(container);
				total_height = 0;
			} else {
				total_height += height;
			}
		});
		$('.subgenre_bubble_list').first().remove();
		var $scrollbar = $('.subgenre_bubble_list_wrapper');
		scrollbar_genres = new scrollbar($scrollbar[0], {
			show: true,
			width: 'auto',
			scrollareaY: false
		});
		genres.hide();
	});
}

BodyEndFunc.push({'z_get_age_limit_error': function () {
	/* [97619] Защищаем малолеток от взрослых книг */
	var $ageErrorBlock = $('.get_age_limit_error');
	$ageErrorBlock.on('click', function (e) {
		e.preventDefault();
		alert(__l('Запрашиваемая книга не соответствует вашему возрасту.\nВыберите другую книгу.'));
		return false;
	});
}});

/* [101269] Замена отсутствующей обложки на модный блок с переводимым текстом */
BodyEndFunc.push({'z_check_error_img': function () {
	$(window).load(function () {
		litres.loadJs('/static/litres/modules/no-cover/js/no-cover.js', function () {
			setNoImgCovers();
		});
	});
}});

BodyEndFunc.push({'z_del_megaCookie': function () {
	if(litres.megafonSubscribe && !$('#banner__megafon').length){
		setCookie('subscr_notify', '', -1, '/');
	}
}});

/* [103536] */
function runCookieAgreement() {
	var $agreementPopup = $('#cookie-agreement');
	if ($agreementPopup.length && !getCookie('cookie-agreement')) {
		$agreementPopup.show();
		$agreementPopup.find('.cookie-agreement__button').on('click', function (e) {
			e.preventDefault();
			setCookie('cookie-agreement', 1, 1825, '/');
			$agreementPopup.hide();
		});
	}
}

/**
 * @description getCoverSrc() возвращает src обложки книги
 * @param {number|string} release_file атрибут release_file у книги
 * @param {number|string} size ширина/высота обложки
 * @param {boolean} [prefix] если true, значит в size передана высота
 * @return {string} src обложки книги
*/
function getCoverSrc(release_file, size, prefix) {
	var coverPrefix = prefix ? "h" : "";
	var releaseId = "";
	var releaseIdTemp = "";
	var releaseFile = String(release_file);
	var releaseTemplate = "00000000";
	var src = "https://cv" + releaseFile.substr(releaseFile.length - 2, 1) +
		".litres.ru/static/bookimages/";
	// 8 - разрядность id файла. если короче, добавить 0
	if (releaseFile.length < 8) {
		releaseId += releaseTemplate.substr(0, 8 - releaseFile.length);
	}
	releaseId += releaseFile;
	releaseIdTemp = releaseId.slice(0,2) + "/" + releaseId.slice(2,4) + "/" + releaseId.slice(4,6);
	src += releaseIdTemp + "/" + releaseId + ".bin.dir/" + releaseId + ".cover_" +
		coverPrefix + size + ".jpg";
	return src;
}

// [103582] sticker_sum (метка новых книг) не работает у анонима
function updateMyBooksSticker() {
	var $counter = $('.user_action_button .popup_link_sticker');

	if (!$counter) {
		return;
	}

	var $wishlistCounter = $('.my-books-item_wishlist .my-books-item__counter'),
		$basketCounter = $('.my-books-item_basket .my-books-item__counter');

	var bsk = getCookie('BSK') || '',
		lks = getCookie('LKS') || '';

	var inBasket = bsk.length ? bsk.split(',').length : 0,
		inWishlist = lks.length ? lks.split(',').length : 0;

	if (inBasket > 0) {
		$basketCounter.text(inBasket);
	}

	if (inWishlist > 0) {
		$wishlistCounter.text(inWishlist);
	}

	var inBasketLast = Number(getCookie('BSK_LAST')) || 0,
		inWishlistLast = Number(getCookie('LKS_LAST')) || 0;

	// sum - количество артов в корзине и отложенном
	// sumLast - количество артов в корзине и отложенном при последнем заходе
	var sum = inBasket + inWishlist,
		sumLast = inBasketLast + inWishlistLast;

	// Здесь, если diff меньше нуля, значит из корзины или отложенного были удалены арты.
	// В этом случае вычитаем из sum sumLast с учтенной разницей.
	// Например, при последнем заходе на страницу "Мои книги" sumLast = sum = 5,
	// а после удаления 2 артов из корзины sum = 3
	// Т. е. diff = 2, значение counter = 3 - (5 - 2) = 0
	var diff = sum - sumLast,
	counter = diff >= 0 ? diff : sum - (sumLast + diff);

	if (!$counter.length) {
		$counter = $('<div class="popup_link_sticker">' + counter + '</div>');
		$('.user_action_button').append($counter);
	}

	if (counter > 9) {
		counter = 9;
		$counter.addClass('popup_link_sticker_limit');
	} else {
		$counter.removeClass('popup_link_sticker_limit');
	}

	if (counter > 0) {
		$counter.show();
		$counter.text(counter);
		$counter.attr('data-count', counter);
	} else {
		$counter.text(0);
		$counter.attr('data-count', 0);
		$counter.hide();
	}
}
function resetMyBooksStickerCookies() {
	setCookie('BSK_LAST', 0, 30, '/');
	setCookie('LKS_LAST', 0, 30, '/');
}

/* [109254] Поставить пиксель на все страницы сайта (Рекламная Кампания) */
window.addEventListener('load', function () {
	var pixel = document.createElement('img');
	pixel.src = '//dmp.vihub.ru/s?sa=2636';
});

/* [107798] Подключить прием кредиток через Paymentwall на en.litres.ru под параметром */
var PaymentwallBrickInit = false;
function paymentwallBrick() {
	var $container = $('#paymentwall-popup');
	var $form = $('#paymentwall-form');
	var $cardNumber = $form.find('#card-number');
	var $cardExpMonth = $form.find('#card-exp-month');
	var $cardExpYear = $form.find('#card-exp-year');
	var $cardFakeExp = $form.find('#card-date');
	var $cardCvv = $form.find('#card-cvv');
	var $order = $form.find('#card-order-id');
	var keyUpTimer = 0;
	var isError = false;
	var brick = {};
	var makeFocus = true;
	var editCardNum = 0;
    var editDate = 0;

	$form.find('#paymentwall-form__button .summ').text($('#GMCountCell').val());

	$container.overlay({
		fixed: false,
		speed: 100,
		mask: {
			color: '#000',
			loadSpeed: 200,
			opacity: 0.7
		},
		onLoad: function () {
			$container.css({'left': '50%'});
			$cardNumber.focus();
		}
	});
	$container.data('overlay').load();

	hideErrors();
	if (PaymentwallBrickInit) {
		return;
	}
	$container.addClass('loading');

	litres.loadJs('https://api.paymentwall.com/brick/brick.1.4.js', function () {
	    PaymentwallBrickInit = true;
	    $container.removeClass('loading');

	    brick = new Brick({
	        public_key: 't_413616aa81721dd02b723f05db0744',
	        form: { formatter: true }
	    }, 'custom');

	    $form.on('submit', function(e) {
	        e.preventDefault();
	        submitBrickForm();
	    });
	});

	$cardNumber.Mask('0000 0000 0000 0000', {
        onKeyPress: selectPayment,
        onComplete: function(cep) {
            editCardNum++;
        }
    });
    $cardFakeExp.Mask('00 / 00', {
        onComplete: function(cep) {
            editDate++;
        }
    });
    $cardCvv.Mask('000');

	$form.find('input').on('keydown', function () {
        var $self = $(this);
        clearTimeout(keyUpTimer);
        keyUpTimer = setTimeout(function () {
            switch ($self.attr('id')) {
                case 'card-date':
                    var value = $cardFakeExp.val().replace(/\s/g, '').split('/');
                    $cardExpMonth.val(value[0]);
                    $cardExpYear.val(value[1]);
                    $cardFakeExp.removeClass('input_error').next().removeClass('label-post-text_error');
                    validateDate();
                    break;

                case 'card-number':
                	$cardNumber.removeClass('input_error').next().removeClass('label-post-text_error');
                    validateCard();
                    break;

                case 'card-cvv':
                	$cardCvv.removeClass('input_error').next().removeClass('label-post-text_error');
                    validateCvv();
                    break;
            }
        }, 300);
    });

	function validateCardInputs() {
		isError = false;
	    validateCard(true);
	    validateDate(true);
	    validateCvv(true);
	}

	function validateCard(fastCheck) {
        var cardNumber = $cardNumber.cleanVal();
        var isVisa = cardNumber.substring(0, 1) == '4';
        var isMasterCard = (parseInt(cardNumber.substring(0, 2)) >= 51 && parseInt(cardNumber.substring(0, 2)) <= 55) ||
            (parseInt(cardNumber.substring(0, 4)) >= 2221 && parseInt(cardNumber.substring(0, 4)) <= 2720);
        var isAmericanExpress = parseInt(cardNumber.substring(0, 2)) == 34 || parseInt(cardNumber.substring(0, 2)) == 37;
        var cardLength = isAmericanExpress ? 15 : 16;

        if (!validateFirstNums(cardNumber)) {
            showError($cardNumber);
            isError = true;
            return;
        }

        if ((!cardNumber.length || cardNumber.length < cardLength) && !fastCheck) {
            isError = true;
            return;
        }

        if ((!isVisa && !isMasterCard && !isAmericanExpress) ||
           (!checkLuhnAlgorithm(cardNumber) && !isAmericanExpress) ||
           !(parseInt(cardNumber) > 0) ||
           cardNumber.length < cardLength) {
           showError($cardNumber);
           isError = true;
           return;
       }

        if (editCardNum > 1) {
            makeFocus = false;
        }

        if (makeFocus) {
        	$cardFakeExp.focus();
        }
    }

    function validateFirstNums(cardNumber) {
        if (parseInt(cardNumber.substring(0, 1)) == 4) {
            return true;
        }

        if (parseInt(cardNumber.substring(0, 1)) == 5 || parseInt(cardNumber.substring(0, 1)) == 3) {
            if (cardNumber.length < 2 ||
                (parseInt(cardNumber.substring(0, 2)) >= 51 && parseInt(cardNumber.substring(0, 2)) <= 55) ||
                (parseInt(cardNumber.substring(0, 2)) == 34 || parseInt(cardNumber.substring(0, 2)) == 37)) {
                return true;
            }
        }

        if (parseInt(cardNumber.substring(0, 1)) == 2) {
            if (cardNumber.length < 2 ||
                (parseInt(cardNumber.substring(0, 2)) >= 22 && parseInt(cardNumber.substring(0, 2)) <= 27) ||
                (parseInt(cardNumber.substring(0, 3)) >= 222 && parseInt(cardNumber.substring(0, 3)) <= 272) ||
                (parseInt(cardNumber.substring(0, 4)) >= 2221 && parseInt(cardNumber.substring(0, 4)) <= 2720)) {
                return true;
            }
        }

        return false;
    }

    function validateDate(fastCheck) {
        var cardExp = $cardFakeExp.cleanVal();
        var correctDate = parseInt($cardExpMonth.val()) <= 12 &&
            parseInt($cardExpMonth.val()) > 0 &&
            parseInt('20' + $cardExpYear.val()) >= new Date().getFullYear() &&
            !(
                parseInt('20' + $cardExpYear.val()) == new Date().getFullYear() &&
                parseInt($cardExpMonth.val()) < new Date().getMonth() + 1
            );

        if ((!cardExp.length || cardExp.length < 4) && !fastCheck) {
            isError = true;
            return;
        }

        if (!correctDate) {
            showError($cardFakeExp);
            isError = true;
            return;
        }

        if (editDate > 1) {
            makeFocus = false;
        }

        if (makeFocus) {
        	$cardCvv.focus();
        }
    }

    function validateCvv(fastCheck) {
        var cardCvv = $cardCvv.cleanVal();

        if ((!cardCvv.length || cardCvv.length < 3) && !fastCheck) {
            isError = true;
            return;
        }

        if (!(parseInt(cardCvv) > 0)) {
            showError($cardCvv);
            isError = true;
            return;
        }
    }

    function selectPayment() {
        var cardNumber = $cardNumber.cleanVal();
        var isVisa = cardNumber.substring(0, 1) == '4';
        var isMasterCard = (parseInt(cardNumber.substring(0, 2)) >= 51 && parseInt(cardNumber.substring(0, 2)) <= 55) ||
            (parseInt(cardNumber.substring(0, 4)) >= 2221 && parseInt(cardNumber.substring(0, 4)) <= 2720);
        var isAmericanExpress = parseInt(cardNumber.substring(0, 2)) == 34 || parseInt(cardNumber.substring(0, 2)) == 37;

        $('.paymentwall-card__payment-logo').removeClass('payment-logo_color');

        if (isVisa) {
            $('.paymentwall-card__payment-logo_visa').addClass('payment-logo_color');
            return;
        }

        if (isAmericanExpress) {
            $('.paymentwall-card__payment-logo_american-express').addClass('payment-logo_color');
            return;
        }

        if (isMasterCard) {
            $('.paymentwall-card__payment-logo_mastercard').addClass('payment-logo_color');
        }
    }

	function showError($elem) {
	    $elem.addClass('input_error').next().addClass('label-post-text_error');
	}

	function hideErrors() {
	    $form.find('.input').removeClass('input_error');
	    $form.find('.paymentwall-card__card-label-post-text').removeClass('label-post-text_error');
	}

	function disableButton(bool) {
	    $form.find('#paymentwall-form__button').prop('disabled', bool);
	}

	function submitBrickForm() {
	    disableButton(true);

	    validateCardInputs();

	    if (isError) {
	        disableButton(false);
	        return;
	    }

	    $container.addClass('loading');
	    paymentwallBrickTokenize({
            uid: $order.val(),
            cardNum: $cardNumber.cleanVal(),
            cardMonth: $cardExpMonth.val(),
            carYear: '20' + $cardExpYear.val(),
            cardCvv: $cardCvv.cleanVal(),
            errorCallback: function (response) {
                var responseError = response.error;
                if (Array.isArray(responseError)) {
                    responseError = responseError.join('. ');
                }
                $container.removeClass('loading');
                disableButton(false);
                alert(responseError);
            }
        });

	    return false;
	}

	function processPaymentwallBrick(params, extraParams) {
	    var requestParam = {
            uid: params.uid,
            token: params.token,
            save: Number($('#paymentwall-save__checkbox').is(':checked')),
            fingerprint: Brick.getFingerprint(),
            currency: 'RUB',
            email: litres.email
        };
        if (extraParams) {
           for (var param in extraParams) {
               if (!requestParam[param] && extraParams.hasOwnProperty(param)) {
                   requestParam[param] = extraParams[param];
               }
           }
        }
        var Request = {
            url: '/process_paymentwall_brick/',
            HttpRType: 'json',
            Method: 'post',
            params: requestParam,
            OnData: function (data) {
                if (data.status == 'fail') {
                    $container.removeClass('loading paymentwall-w-3ds-frame');
                   	disableButton(false);
                   	alert(data.msg ? data.msg : __l('Произошла ошибка.'));
                    return;
                }

                if (data.status == 'secure' && data.secure.formHTML) {
                    requestParam.formHTML = data.secure.formHTML;
                    paymentwallBrick3ds(requestParam);
                    return;
                }

                if (data.status == 'ok') {
                    window.location = data.ref_url;
                }
            }
        };
        GUJ.PutRequest(Request);
	}

	function paymentwallBrickTokenize(params) {
		brick.tokenizeCard({
            card_number: params.cardNum,
            card_expiration_month: params.cardMonth,
            card_expiration_year: params.carYear,
            card_cvv: params.cardCvv
        }, function(response) {
            if (response.type == 'Error') {
                params.errorCallback(response);
                return;
            }

            params.token = response.token;
            processPaymentwallBrick(params);
        });
	}

	/* [114981] Поддержать 3DS в paymentwall по схеме Brick – верстка */
    function paymentwallBrick3ds(params) {
        $container.append(create3dsIframe(params.formHTML)).addClass('paymentwall-w-3ds-frame');
        $container.removeClass('loading');

        window.addEventListener('message', function (message) {
            var messageData = JSON.parse(message.data);
            var extraParams = {
                secure_token: messageData.data.secure_token,
                charge_id: messageData.data.charge_id
            };

            if (brick.chargeId == messageData.data.charge_id) {
                return;
            }

            brick.chargeId = messageData.data.charge_id;
            params.container = $container;
            processPaymentwallBrick(params, extraParams);
            $container.addClass('loading').removeClass('paymentwall-w-3ds-frame')
                .find('#paymentwall-brick-3ds-iframe').remove();
        });

        function create3dsIframe(html) {
            return '<iframe src="' + createUrlFor3ds(html) +
                '" id="paymentwall-brick-3ds-iframe"' +
                ' class="paymentwall-brick-3ds-iframe" scrolling="no"' +
                ' frameborder="0" allowtransparency="true"></iframe>';
        }

        function createUrlFor3ds(html) {
            var $form3ds = $(html).find('#3ds-submission-form');
            var urlFor3ds = '';

            urlFor3ds += $form3ds.attr('action');
            $form3ds.find('input[type=hidden]').each(function (indx, element) {
                urlFor3ds += '&' + $(element).attr('name') + '=' + $(element).attr('value');
            });

            return urlFor3ds;
        }
    }
}

/**
 * @description checkLuhnAlgorithm() проверка номера кредитной карты по ISO/IEC 7812 (Алгоритм Луна)
 * @param {number|string} card_number номер кредитной карты
 * @return {boolean} результат проверки
*/
function checkLuhnAlgorithm(card_number) {
	var arr = [];
	var cardNumber = card_number.toString();
	var summ = 0;

	for (var i = 0; i < cardNumber.length; i++) {
		if (i % 2 === 0) {
			var m = parseInt(cardNumber[i]) * 2;
			if (m > 9) {
				arr.push(m - 9);
			} else {
				arr.push(m);
			}
		} else {
			var n = parseInt(cardNumber[i]);
			arr.push(n);
		}
	}

	if (!arr.length) {
        return false;
    }

	summ = arr.reduce(function (a, b) {
		return a + b;
	});

	return Boolean(!(summ % 10));
}

function make_ajax_rebill(obj) {
	var Request = {
		url: '/pages/ajax_empty2/',
		Method: 'post',
		params: {
			action: 'process_rebill',
			js: true,
			descr: obj.descr,
			rebill: obj.rebill,
			summ: obj.summ
		},
		HttpRType: 'json',
		OnData: function(data){
			if (obj.rebill && data.url) {
				top.location.href = data.url;
			}
		},
		OnDataFail: function(fake1,fake2){
		  alert(__l('Произошла ошибка. Платеж отклонен.'));
		}
	};
	if (obj.custom_set) {
		Request.params.custom_set = obj.custom_set;
	}
	if (obj.ref_url) {
		Request.params.ref_url = obj.ref_url;
	}

	CSRF.sendRequest(Request);
	return false;
}

/* [105886] */
if (!litres.user) {
	BodyEndFunc.push({'z_coupon_alert': function () {
		$('#code1').on('keydown', function () {
			showPopupError({
				html: __l('Для активации купона необходимо авторизироваться')
			});
		})
	}});
}
/* [116014] Верстка, интеграция с платежным шлюзом MAP */
var payMAPInit = false;
var lastMAPSumm = 0;
function payMAP(opts) {
	var $wrapper = $('#map_iframe_box');
	var $frame = $('#mapframe');
	var $summ = $('#GMCountCell');
	var order_id = 0;
	var params = opts || {};
	var rebill = params.rebill;
    var asyncTimeout = {
        counter: 0,
        start: 0
    };
    var delay = 300;

	function init() {
		var proceedParams = {
            summ: $summ.val(),
            descr: 73
        }
        if (rebill) {
        	proceedParams.rebill = rebill;
        }
		if (payMAPInit && $summ.val() == lastMAPSumm && !rebill) {
			$wrapper.data('overlay').load();
			return;
		}

		$wrapper.addClass('loading');
		$wrapper.overlay({
			fixed: false,
			speed: 100,
			mask: {
				color: '#000',
				loadSpeed: 200,
				opacity: 0.7
			},
			onLoad: function () {
				$wrapper.css({'left': '50%', 'margin-left': '-250px'});
			}
		});
		$wrapper.data('overlay').load();

		if (order_id) {
			asyncOrderStatus();
			return;
		}
		proceedPaymentMAP(proceedParams, asyncOrderStatus);
	}

	function asyncOrderStatus() {
        GUJ.PutRequest({
            url: '/pages/async_order_status/',
            HttpRType: 'json',
            params: {
                order_id: order_id
            },
            Method: 'post',
            OnData: function (data) {
            	if (data.status == 'init') {
            		if (asyncTimeout.counter === 0) {
            		    asyncTimeout.start = Date.now();
            		}
                    if (asyncTimeout.counter >= 10) {
                        delay = 2000;
                    }
                    /* [136265] */
                    if (Date.now() - asyncTimeout.start >= 300000) {
                    	$wrapper.data('overlay').close();
                        alert(__l('Произошла ошибка платежной системы. Попробуйте провести оплату другим способом.'));
                        asyncTimeout.counter = 0;
                        asyncTimeout.start = 0;
                        order_id = null;
                        return;
                    }
                    asyncTimeout.counter++;
            	    setTimeout(reloadMAPFrame, delay);
            	    return;
            	}
                asyncTimeout.counter = 0;
            	if (data.status == 'error') {
            	    $wrapper.data('overlay').close();
            	    alert(__l('Произошла ошибка. Платеж отклонен.'));
            	    order_id = null;
            	    return;
            	}

            	/* [123855] */
                if (data.tag2) {
                    var $frameHtml = $frame.contents();
                    $frameHtml.find('body').append(create3dsForm(data.tag2));
                    $frameHtml.contents().find('#map_3ds_form').submit();
                    $wrapper.removeClass('loading');
                    return;
                }

            	if (data.tag1) {
            		$frame.attr('src', data.tag1);
                  	$wrapper.removeClass('loading');
                   	payMAPInit = true;
                   	return;
            	}

            	if (rebill && order_id) {
	                $frame.attr('src', '/static/error_pages/payment_ok.html?descr=73&order=' + order_id);
	                $wrapper.removeClass('loading');
	            }
            },
            OnDataFail: function (data) {
		        console.log(data);
		    }
        });
	}

	function create3dsForm(tag2) {
        var tag2Data = JSON.parse(tag2);

        return '<form id="map_3ds_form" action="' + tag2Data.ACSUrl + '" method="post" >' +
            createInputsFor3ds(tag2Data) +
        '</form>';
    }

	function createInputsFor3ds(tag2Data) {
        var origin = window.location.origin;
        var inputsFor3ds = '<input type="text" name="TermUrl" value="' + origin +
            '/map_queue_3ds_proceed/?order_id=' + order_id + '" />';

        for (var key in tag2Data) {
            var inputName = key == 'ThreeDSKey' ? 'MD' : key;
            inputsFor3ds += '<input type="text" name="' + inputName + '" value="' + tag2Data[key] + '"/>';
        }

        return inputsFor3ds;
    }

	function proceedPaymentMAP(opts, callback) {
		var custom_set = $('input[name="custom_set"]').val();
		var Request = {
		    url: '/pages/proceed_payment/',
		    HttpRType: 'json',
		    params: {
		        iframe: 1,
		        summ: opts.summ,
		        descr: opts.descr,
		        ajax: true,
		        js: 1
		    },
		    OnData: function (data) {
		    	lastMAPSumm = opts.summ;
		    	if (opts.summ === $summ.val()) {
			        if (data.error) {
		                console.log('Error proceed_payment MAP: ' + data.error);
		                return;
		            }

		            order_id = data.id;
		            callback(data);
	            }
		    },
		    OnDataFail: function (data) {
		        console.log(data);
		    }
		};

		if (opts.rebill) {
		    Request.params.rebill = opts.rebill;
		}
		if (custom_set && custom_set.length) {
		    Request.params.custom_set = custom_set;
		    Request.params.ref_url = '/pages/my_books_fresh/?custom_set=' + custom_set;
		}
		GUJ.PutRequest(Request);
	}

	function reloadMAPFrame() {
		payMAPInit = false;
		init();
	}

	init();
}

function launchSocNet() {
	if (typeof SocNet != 'undefined') {
		if (typeof (FB) == 'undefined') {
			SocNet.push('fb', { InitCall: true });
		}
		if (typeof (VK) == 'undefined' || (typeof VK === 'object' && !VK._apiId)) {
			SocNet.push('vk', { InitCall: true });
		}
		if (typeof (mailru) == 'undefined') {
			SocNet.push('ma', { InitCall: true });
		}
		if (!SocNet.services.google) {
		    SocNet.push('google', { InitCall: true });
		}
	}
}

BodyLoadFunc.push({
	'card_bonus': function () {
		$('#show_cardbonus').on('click', function () {
			if (litres.isNewPayment || litres.isNewPaymentBilling) {
				return Payment.open({
					mode: 'add_card',
					ref_url: litres.ref_url
				});
			}
		});
	}
});

// Для тех случаев, когда нужно отправить clicktag из js
function sendClicktag(clicktag, event) {
	var loc = document.location + '';
	var coords = event ? (event.pageX + '.' + event.pageY) : '0.0';
	var yaCounter = window.yaCounter2199583 || window.top.yaCounter2199583;

	loc = loc.replace(/https?:\/\/[\w\.\-]+(:\d+)?\//, '');
	loc = loc.replace(/#.*$/, '');
	loc = loc.replace(/ /, '+');
	GUJ.PutRequest({
		url: '/clctrack/',
		params: {
			p: coords,
			w: document.documentElement.clientWidth,
			u: loc,
			x: 'div.' + clicktag + '/div.2'
		}
	});
	if (typeof yaCounter !== 'undefined') {
		yaCounter.reachGoal('ct_' + clicktag);
	}
}

function createOrder(opts, callback) {
	var custom_set = $('input[name="custom_set"]').val();
	var params = {
		json: true
	};
	for (var param in opts) {
	    if (!params[param]) {
	        params[param] = opts[param];
	    }
	}
    var Request = {
	    url: '/pages/proceed_payment/',
	    HttpRType: 'json',
	    Method: 'post',
	    params: params,
	    OnData: function (data) {
	        if (typeof callback === 'function') {
	            callback(data);
	        }
	    },
	    OnDataFail: function (data) {
	        console.log(data, 'OnDataFail');
	    }
	};
	if (custom_set && custom_set.length) {
	    Request.params.custom_set = custom_set;
	    Request.params.ref_url = '/pages/my_books_fresh/?custom_set=' + custom_set;
	}
	GUJ.PutRequest(Request);
}

// [132545] Установить метрику от Яндекс.Деньги (покупка с реферальной программы)
function checkYaMoneyRef() {
    var yaParams = {
        clickid: getUrlVars()['clickId'],
        promocode: getUrlVars()['promocode']
    };

    if (yaParams.clickid && yaParams.promocode) {
        setCookie('YaMoneyReferal', JSON.stringify(yaParams), 30, '/');
    }
}

BodyLoadFunc.push({
    'checkYaMoneyRef': checkYaMoneyRef
});

/*!
 * jQuery Tools v1.2.7 - The missing UI library for the Web
 *
 * overlay/overlay.js
 * overlay/overlay.apple.js
 * toolbox/toolbox.expose.js
 *
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 *
 * http://flowplayer.org/tools/
 *
 */
(function(a){a.tools=a.tools||{version:"v1.2.7"},a.tools.overlay={addEffect:function(a,b,d){c[a]=[b,d]},conf:{close:null,closeOnClick:!0,closeOnEsc:!0,closeSpeed:"fast",effect:"default",fixed:!a.browser.msie||a.browser.version>6,left:"center",load:!1,mask:null,oneInstance:!0,speed:"normal",target:null,top:"10%"}};var b=[],c={};a.tools.overlay.addEffect("default",function(b,c){var d=this.getConf(),e=a(window);d.fixed||(b.top+=e.scrollTop(),b.left+=e.scrollLeft()),b.position=d.fixed?"fixed":"absolute",this.getOverlay().css(b).fadeIn(d.speed,c)},function(a){this.getOverlay().fadeOut(this.getConf().closeSpeed,a)});function d(d,e){var f=this,g=d.add(f),h=a(window),i,j,k,l=a.tools.expose&&(e.mask||e.expose),m=Math.random().toString().slice(10);l&&(typeof l=="string"&&(l={color:l}),l.closeOnClick=l.closeOnEsc=!1);var n=e.target||d.attr("rel");j=n?a(n):null||d;if(!j.length)throw"Could not find Overlay: "+n;d&&d.index(j)==-1&&d.click(function(a){f.load(a);return a.preventDefault()}),a.extend(f,{load:function(d){if(f.isOpened())return f;var i=c[e.effect];if(!i)throw"Overlay: cannot find effect : \""+e.effect+"\"";e.oneInstance&&a.each(b,function(){this.close(d)}),d=d||a.Event(),d.type="onBeforeLoad",g.trigger(d);if(d.isDefaultPrevented())return f;k=!0,l&&a(j).expose(l);var n=e.top,o=e.left,p=j.outerWidth({margin:!0}),q=j.outerHeight({margin:!0});typeof n=="string"&&(n=n=="center"?Math.max((h.height()-q)/2,0):parseInt(n,10)/100*h.height()),o=="center"&&(o=Math.max((h.width()-p)/2,0)),i[0].call(f,{top:n,left:o},function(){k&&(d.type="onLoad",g.trigger(d))}),l&&e.closeOnClick&&a.mask.getMask().one("click",f.close),e.closeOnClick&&a(document).on("click."+m,function(b){a(b.target).parents(j).length||f.close(b)}),e.closeOnEsc&&a(document).on("keydown."+m,function(a){a.keyCode==27&&f.close(a)});return f},close:function(b){if(!f.isOpened())return f;b=b||a.Event(),b.type="onBeforeClose",g.trigger(b);if(!b.isDefaultPrevented()){k=!1,c[e.effect][1].call(f,function(){b.type="onClose",g.trigger(b)}),a(document).off("click."+m+" keydown."+m),l&&a.mask.close();return f}},getOverlay:function(){return j},getTrigger:function(){return d},getClosers:function(){return i},isOpened:function(){return k},getConf:function(){return e}}),a.each("onBeforeLoad,onStart,onLoad,onBeforeClose,onClose".split(","),function(b,c){a.isFunction(e[c])&&a(f).on(c,e[c]),f[c]=function(b){b&&a(f).on(c,b);return f}}),i=j.find(e.close||".close"),!i.length&&!e.close&&(i=a("<a class=\"close\"></a>"),j.prepend(i)),i.click(function(a){f.close(a)}),e.load&&f.load()}a.fn.overlay=function(c){var e=this.data("overlay");if(e)return e;a.isFunction(c)&&(c={onBeforeLoad:c}),c=a.extend(!0,{},a.tools.overlay.conf,c),this.each(function(){e=new d(a(this),c),b.push(e),a(this).data("overlay",e)});return c.api?e:this}})(jQuery);
(function(a){var b=a.tools.overlay,c=a(window);a.extend(b.conf,{start:{top:null,left:null},fadeInSpeed:"fast",zIndex:9999});function d(a){var b=a.offset();return{top:b.top+a.height()/2,left:b.left+a.width()/2}}var e=function(b,e){var f=this.getOverlay(),g=this.getConf(),h=this.getTrigger(),i=this,j=f.outerWidth({margin:!0}),k=f.data("img"),l=g.fixed?"fixed":"absolute";if(!k){var m=f.css("backgroundImage");if(!m)throw"background-image CSS property not set for overlay";m=m.slice(m.indexOf("(")+1,m.indexOf(")")).replace(/\"/g,""),f.css("backgroundImage","none"),k=a("<img src=\""+m+"\"/>"),k.css({border:0,display:"none"}).width(j),a("body").append(k),f.data("img",k)}var n=g.start.top||Math.round(c.height()/2),o=g.start.left||Math.round(c.width()/2);if(h){var p=d(h);n=p.top,o=p.left}g.fixed?(n-=c.scrollTop(),o-=c.scrollLeft()):(b.top+=c.scrollTop(),b.left+=c.scrollLeft()),k.css({position:"absolute",top:n,left:o,width:0,zIndex:g.zIndex}).show(),b.position=l,f.css(b),k.animate({top:b.top,left:b.left,width:j},g.speed,function(){f.css("zIndex",g.zIndex+1).fadeIn(g.fadeInSpeed,function(){i.isOpened()&&!a(this).index(f)?e.call():f.hide()})}).css("position",l)},f=function(b){var e=this.getOverlay().hide(),f=this.getConf(),g=this.getTrigger(),h=e.data("img"),i={top:f.start.top,left:f.start.left,width:0};g&&a.extend(i,d(g)),f.fixed&&h.css({position:"absolute"}).animate({top:"+="+c.scrollTop(),left:"+="+c.scrollLeft()},0),h.animate(i,f.closeSpeed,b)};b.addEffect("apple",e,f)})(jQuery);
(function(a){a.tools=a.tools||{version:"v1.2.7"};var b;b=a.tools.expose={conf:{maskId:"exposeMask",loadSpeed:"slow",closeSpeed:"fast",closeOnClick: !0,closeOnEsc: !0,canClose: !0,zIndex:9998,opacity:.8,startOpacity:0,color:"#fff",onLoad:null,onClose:null}};function c(){if(a.browser.msie){var b=a(document).height(),c=a(window).height();return[window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth,b-c<20?c:b]}return[a(document).width(),a(document).height()]}function d(b){if(b)return b.call(a.mask);}var e,f,g,h,i;a.mask={load:function(j,k){if(g)return this;typeof j=="string"&&(j={color:j}),j=j||h,h=j=a.extend(a.extend({},b.conf),j),e=a("#"+j.maskId),e.length||(e=a("<div/>").attr("id",j.maskId),a("body").append(e));var l=c();e.css({position:"absolute",top:0,left:0,width:l[0],height:l[1],display:"none",opacity:j.startOpacity,zIndex:j.zIndex}),j.color&&e.css("backgroundColor",j.color);if(d(j.onBeforeLoad)=== !1)return this;j.closeOnEsc&&a(document).on("keydown.mask",function(b){b.keyCode==27&&a.mask.close(b)}),j.closeOnClick&&e.on("click.mask",function(b){a.mask.close(b)}),a(window).on("resize.mask",function(){a.mask.fit()}),k&&k.length&&(i=k.eq(0).css("zIndex"),a.each(k,function(){var b=a(this);/relative|absolute|fixed/i.test(b.css("position"))||b.css("position","relative")}),f=k.css({zIndex:Math.max(j.zIndex+1,i=="auto"?0:i)})),e.css({display:"block"}).fadeTo(j.loadSpeed,j.opacity,function(){a.mask.fit(),d(j.onLoad),g="full"}),g= !0;return this},close:function(c){if(g){if(!h.canClose){h.canClose= !0;return this;}if(d(h.onBeforeClose)=== !1)return this;e.fadeOut(h.closeSpeed,function(){d(h.onClose),f&&f.css({zIndex:i}),g= !1}),a(document).off("keydown.mask"),e.off("click.mask"),a(window).off("resize.mask")}return this},fit:function(){if(g){var a=c();e.css({width:a[0],height:a[1]})}},getMask:function(){return e},isLoaded:function(a){return a?g=="full":g},getConf:function(){return h},getExposed:function(){return f}},a.fn.mask=function(b){a.mask.load(b);return this},a.fn.expose=function(b){a.mask.load(b,this);return this}})(jQuery);
