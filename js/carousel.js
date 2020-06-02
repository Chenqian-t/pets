+(function (w) {
	w.demo = {};
	w.demo.css = function (node, type, value) {
		if (typeof node === "object" && typeof node["transform"] === "undefined") {
			node["transform"] = {};
		}
		if (arguments.length >= 3) {
			// 设置
			let text = "";
			node["transform"][type] = value;
			for (item in node["transform"]) {
				if (node["transform"].hasOwnProperty(item)) {
					switch (item){
						case "translateX":
						case "translateY":
						case "translateZ":
							text += (item + "(" + node["transform"][item] + "px)");
							break;
						case "scale":
							text += (item + "(" + node["transform"][item] + ")");
							break;
						case "rotate":
							text += (item + "(" + node["transform"][item] + "deg)");
							break;
					}
				}
			}
			node.style.transform = node.style.webkitTransform = text;
		} else if (arguments.length === 2) {
			// 读取
			value = node["transform"][type];
			if (typeof value === "undefined") {
				switch (type){
					case "translateX":
					case "translateY":
					case "translateZ":
					case "rotate":
						value = 0;
						break;
					case "scale":
						value = 1;
						break;
				}
			}
			return value;
		}
	}
	w.demo.carousel = function (arr) {
		let pointsLength = arr.length;
		arr = arr.concat(arr);
		// 获取轮播容器
		let carouselWrap = document.querySelector(".carousel-wrap");
		if (carouselWrap) {					
			// 布局相关
			let ulNode = document.createElement("ul");
			ulNode.classList.add("list");
			let styleNode = document.createElement("style");
			styleNode.innerHTML = ".carousel-wrap > .list > li {width: " + (100/arr.length) + "%;}.carousel-wrap > .list {width: " + (100*arr.length) + "%;}";
			// 创建li
			for (let i = 0; i < arr.length; i++) {
				ulNode.innerHTML += '<li><a href="#"><img src="' + arr[i] + '"/></a></li>';
			}
			carouselWrap.appendChild(ulNode);
			document.head.appendChild(styleNode);
			// 获取图片高度以设置外层容器高度
			let imgsNode = document.querySelector(".carousel-wrap > .list > li > a > img");
			setTimeout(function () {
				carouselWrap.style.height = imgsNode.offsetHeight + "px";
			}, 100);
			
			// 小圆点布局
			let pointsWrap = document.querySelector(".carousel-wrap > .points-wrap");
			let pointsSpan;
			if (pointsWrap) {
				for (let i = 0; i < pointsLength; i++) {
					if (i === 0) {
						pointsWrap.innerHTML += "<span class='active'></span>";
					} else {
						pointsWrap.innerHTML += "<span></span>";
					}
				}
				pointsSpan = document.querySelectorAll(".carousel-wrap > .points-wrap > span");
			}
			
			// 滑动实现
			/*手指一开始的位置*/
			let startX = 0;
			let startY = 0;
			/*元素一开始的位置*/
			let elementX = 0;
			let elementY = 0;
			let index = 0;
			
			let isX = true;
			let isFirst = true;
			
			carouselWrap.addEventListener("touchstart", function (e) {
				e = e || event;
				let touchC = e.changedTouches[0];
				ulNode.style.transition = "none";
				// 无缝滑动逻辑
				/*index代表图片下标*/
				let index = demo.css(ulNode, "translateX")/document.documentElement.clientWidth;
				if (-index === 0) {
					index = -pointsLength;
				} else if (-index == (arr.length - 1)) {
					index = -(pointsLength - 1);
				}
				demo.css(ulNode, "translateX", index*document.documentElement.clientWidth);
				startX = touchC.clientX;
				startY = touchC.clientY;
				//elementX = ulNode.offsetLeft;
				elementX = demo.css(ulNode, "translateX");
				elementY = demo.css(ulNode, "translateY");
				
				// 清楚自动轮播影响
				clearInterval(time);
				
				isX = true;
				isFirst = true;
			});
			carouselWrap.addEventListener("touchmove", function (e) {
				if (!isX) {
					return;
				}
				e = e || event;
				let touchC = e.changedTouches[0];
				let nowX = touchC.clientX;
				let nowY = touchC.clientY;
				let distanceX = nowX - startX;
				let distanceY = nowY - startY;
				
				// 防抖动
				if (isFirst) {
					isFirst = false;
					if (Math.abs(distanceY) > Math.abs(distanceX)) {
						// y轴上滑
						isX = false;
						return;
					}
				}
				
				//ulNode.style.left = elementX + distanceX + "px";
				demo.css(ulNode, "translateX", elementX + distanceX);
			});
			carouselWrap.addEventListener("touchend", function (e) {
				e = e || event;
				//let index = ulNode.offsetLeft/document.documentElement.clientWidth;
				index = demo.css(ulNode, "translateX")/document.documentElement.clientWidth;
				index = Math.round(index);
				if (index > 0) {
					index = 0;
				} else if (index < 1 - arr.length) {
					index = 1 - arr.length;
				}
				pointsActive(index);
				ulNode.style.transition = "0.5s transform";
				//ulNode.style.left = index*(document.documentElement.clientWidth) + "px";
				demo.css(ulNode, "translateX", index*(document.documentElement.clientWidth));
				
				// 开启轮播
				if (needAuto == null ? false : true) {
					auto();
				}
			});
			
			// 自动轮播
			let time;
			// 获取自动轮播盒子属性
			let needAuto = carouselWrap.getAttribute("needAuto");
			if (needAuto == null ? false : true) {
				auto();
			}
			function auto() {
				clearInterval(time);
				time = setInterval(function () {
					if (index == 1 - arr.length) {
						ulNode.style.transition = "none";
						index = 1 - arr.length/2;
						demo.css(ulNode, "translateX", index*document.documentElement.clientWidth);
					}
					setTimeout(function () {
						index--;
						ulNode.style.transition = "1s transform";
						pointsActive(index);
						demo.css(ulNode, "translateX", index*document.documentElement.clientWidth);
					},50);
				}, 2000);
			}
			
			// 小圆点
			function pointsActive(index) {
				if (!pointsSpan) {
					return;
				}
				for (var i = 0; i < pointsSpan.length; i++) {
					pointsSpan[i].classList.remove("active");
				}
				pointsSpan[-index%pointsLength].classList.add("active");
			}
		}
	}
	w.demo.dragNav = function () {
		//滑屏区
    	var wrap = document.querySelector(".drag-nav-wrapper");
    	//滑屏元素
    	var item = document.querySelector(".drag-nav-wrapper .list");
    	
    	var startX = 0;
    	var elementX = 0;
    	var minX = wrap.clientWidth - item.offsetWidth;
    	
    	//快速滑屏参数
    	var lastTime = 0;
    	var lastPoint = 0;
    	var timeDis = 1;
    	var pointDis = 0;
    	
    	wrap.addEventListener("touchstart", function (ev) {
    		ev = ev || event;
    		var touchC = ev.changedTouches[0];
    		startX = touchC.clientX;
    		elementX = demo.css(item, "translateX");
    		
    		item.style.transition = "none";
    		
    		lastTime = new Date().getTime();
    		lastPoint = touchC.clientX;
    		
    		pointDis = 0;
    		item.handMove = false;
    	});
    	wrap.addEventListener("touchmove", function (ev) {
    		ev = ev || event;
    		var touchC = ev.changedTouches[0];
    		var nowX = touchC.clientX;
    		var disX = nowX - startX;
    		var translateX = elementX + disX;
    		
    		var nowTime = new Date().getTime();
    		var nowPoint = touchC.clientX;
    		timeDis = nowTime - lastTime;
    		pointDis = nowPoint - lastPoint;
    		
    		lastTime = nowTime;
    		lastPoint = nowPoint;
    		
    		/*橡皮筋效果*/
    		if (translateX > 0) {
    			item.handMove = true;
    			var scale = document.documentElement.clientWidth/((document.documentElement.clientWidth + translateX)*2);
    			translateX = demo.css(item, "translateX") + pointDis*scale;
    		} else if (translateX < minX) {
    			item.handMove = true;
    			var over = minX - translateX;
    			var scale = document.documentElement.clientWidth/((document.documentElement.clientWidth + over)*2);
    			translateX = demo.css(item, "translateX") + pointDis*scale;
    		}
    		demo.css(item, "translateX", translateX);
    	});
    	wrap.addEventListener("touchend", function (ev) {
    		ev = ev || event;
    		var translateX = demo.css(item, "translateX");
    		if (item.handMove) {
    			item.style.transition = "1s transform";
    			if (translateX > 0) {
        			translateX = 0;
        			demo.css(item, "translateX", translateX);
        		} else if (translateX < minX) {
        			translateX = minX;
        			demo.css(item, "translateX", translateX);
        		}
    		} else {
    			//速度越大，走得越远
        		var speed = pointDis/timeDis;
        		speed = Math.abs(speed) < 0.5 ? 0 : speed;
        		var targetX = translateX + speed*200;
        		var time = Math.abs(speed)*0.2;
        		time = time < 1 ? 1 : time;
        		time = time > 2 ? 2 : time;
        		var bsr = "";
        		if (targetX > 0) {
        			targetX = 0;
        			bsr = "cubic-bezier(.26,1.5,.85,1.46)";
        		} else if (targetX < minX) {
        			targetX = minX;
        			bsr = "cubic-bezier(.26,1.5,.85,1.46)";
        		}
        		item.style.transition = time + "s " + bsr + " transform";
        		demo.css(item, "translateX", targetX);
    		}
    	});
	}
	w.demo.verticalMove = function (wrap, callBack) {
		//滑屏区  wrap
    	//滑屏元素
    	var item = wrap.children[0];
    	demo.css(item, "translateZ", 0.1);
    	
    	var startPoint = {x: 0, y: 0,};
    	var elementPoint = {x: 0, y: 0,};
    	var minY = wrap.clientHeight - item.offsetHeight;
    	
    	//快速滑屏参数
    	var lastTime = 0;
    	var lastPoint = 0;
    	var timeDis = 1;
    	var pointDis = 0;
    	
    	//防抖动
    	var isY = true;
    	var isFirst = true;
    	
    	// Tween函数   即点即停
    	var moveTime = 0;
    	var Tween = {
    		Linear: function (t, b, c, d) {
    			return c*t/d + b;
    		},
    		back: function (t, b, c, d, s) {
    			if (s === undefined) s = 1.70158;
    			return c*((t = t/d - 1)*t*((s + 1)*t + s) + 1) + b;
    		},
    	};
    	
    	wrap.addEventListener("touchstart", function (ev) {
    		ev = ev || event;
    		var touchC = ev.changedTouches[0];
    		startPoint.y = touchC.clientY;
    		startPoint.x = touchC.clientX;
    		elementPoint.y = demo.css(item, "translateY");
    		elementPoint.x = demo.css(item, "translateX");
    		
    		item.style.transition = "none";
    		
    		lastTime = new Date().getTime();
    		lastPoint = touchC.clientY;
    		
    		pointDis = 0;
    		item.handMove = false;
    		
    		isY = true;
    	    isFirst = true;
    	    
    	    clearInterval(moveTime);
    	    
    	    if (callBack && typeof callBack["start"] === "function") {
    	    	callBack["start"].call(item.offsetHeight);
    	    }
    	    
    	    minY = wrap.clientHeight - item.offsetHeight;
    	});
    	wrap.addEventListener("touchmove", function (ev) {
    		if (!isY) {
    			return;
    		}
    		ev = ev || event;
    		var touchC = ev.changedTouches[0];
    		var nowPoint = {x: 0, y: 0,};
    		nowPoint.y = touchC.clientY;
    		nowPoint.x = touchC.clientX;
    		var dis = {x: 0, y: 0,};
    		dis.y = nowPoint.y - startPoint.y;
    		dis.x = nowPoint.x - startPoint.x;
    		var translateY = elementPoint.y + dis.y;
    		
    		if (isFirst) {
    			isFirst = false;
    			if (Math.abs(dis.x) > Math.abs(dis.y)) {
    				isY = false;
    				return;
    			}
    		}
    		
    		var nowTime = new Date().getTime();
    		var nowPoint = touchC.clientY;
    		timeDis = nowTime - lastTime;
    		pointDis = nowPoint - lastPoint;
    		
    		lastTime = nowTime;
    		lastPoint = nowPoint;
    		
    		/*橡皮筋效果*/
    		if (translateY > 0) {
    			item.handMove = true;
    			var scale = document.documentElement.clientHeight/((document.documentElement.clientHeight + translateY)*2);
    			translateY = demo.css(item, "translateY") + pointDis*scale;
    		} else if (translateY < minY) {
    			item.handMove = true;
    			var over = minY - translateY;
    			var scale = document.documentElement.clientHeight/((document.documentElement.clientHeight + over)*2);
    			translateY = demo.css(item, "translateY") + pointDis*scale;
    		}
    		demo.css(item, "translateY", translateY);
    		
    		if (callBack && typeof callBack["move"] === "function") {
    	    	callBack["move"].call(item);
    	    }
    	});
    	wrap.addEventListener("touchend", function (ev) {
    		ev = ev || event;
    		var translateY = demo.css(item, "translateY");
    		if (item.handMove) {
    			item.style.transition = "1s transform";
    			if (translateY > 0) {
        			translateY = 0;
        			demo.css(item, "translateY", translateY);
        		} else if (translateY < minY) {
        			translateY = minY;
        			demo.css(item, "translateY", translateY);
        		}
        		
        		if (callBack && typeof callBack["end"] === "function") {
	    	    	callBack["end"]();
	    	    }
    		} else {
    			//速度越大，走得越远
        		var speed = pointDis/timeDis;
        		speed = Math.abs(speed) < 0.5 ? 0 : speed;
        		var targetY = translateY + speed*200;
        		var time = Math.abs(speed)*0.2;
        		time = time < 1 ? 1 : time;
        		time = time > 2 ? 2 : time;
        		//var bsr = "";
        		var type = "Linear";
        		if (targetY > 0) {
        			targetY = 0;
        			//bsr = "cubic-bezier(.26,1.5,.85,1.46)";
        			type = "back";
        		} else if (targetY < minY) {
        			targetY = minY;
        			//bsr = "cubic-bezier(.26,1.5,.85,1.46)";
        			type = "back";
        		}
        		//item.style.transition = time + "s " + bsr + " transform";
        		//demo.css(item, "translateY", targetY);
        		bsr(type, targetY, time);
    		}
    	});
    	function bsr(type, targetY, time) {
    		clearInterval(moveTime);
    		// 当前次数
    		var t = 0;
    		// 初始位置
    		var b = demo.css(item, "translateY");
    		// 最终位置 - 初始位置
    		var c = targetY - b;
    		// 总次数
    		var d = time*1000/(1000/60);
    		moveTime = setInterval(function () {
    			t++;
    			if (callBack && typeof callBack["move"] === "function") {
	    	    	callBack["move"].call(item);
	    	    }
    			if (t > d) {
    				clearInterval(moveTime);
    				if (callBack && typeof callBack["end"] === "function") {
		    	    	callBack["end"]();
		    	    }
    			}
    			var point = Tween[type](t, b, c, d);
    			demo.css(item, "translateY", point);
    		}, 1000/60);
    	}
	}
})(window);
