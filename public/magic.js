/*
  Selectors
*/
const menuItem = document.querySelectorAll('.menu-item');
const menuToggleButton = document.querySelector(".menu-toggle-button");
const menuToggleIcon = document.querySelector(".menu-toggle-icon");

const menuItemNum = menuItem.length;
let angle = 70;
const distance = 80;
let startingAngle = 145 + ( -angle / 2 );
let slice = angle / ( menuItemNum - 1 );
let on = false;

/*
  Initial animation
*/

(function initialLogInScreen() {
	document.body.style = "overflow: hidden;"
})()

/*
  Log in button
*/

const TWO_PI = Math.PI * 2;

const button = document.getElementById('authorize-button'),
    label = document.getElementById('label');

let mouseOutTween;// set on mouse-out

TweenMax.set([button, label], {transformPerspective:700});

button.addEventListener('click', function(e) {
	let rect = button.getBoundingClientRect(),
  		x = e.clientX - rect.left,
      y = e.clientY - rect.top,
      hit = {x:x, y:y, radius:1, alpha:1};

  tl.to(hit, 0.5, {radius:200, alpha:0, ease:Power1.easeOut});

});

button.addEventListener('mousemove', function(e) {
  let rect = button.getBoundingClientRect(),
  		x = e.clientX - rect.left,
      y = e.clientY - rect.top,
      rx = -(y / rect.height) + 0.5,
      ry = (x / rect.width) - 0.5,
      rMax = 30;

  TweenMax.to(button, 0.1, {rotationX:rx * rMax, rotationY:ry * rMax});
});

button.addEventListener('mouseout', function(e) {
  if (mouseOutTween) mouseOutTween.kill();
  mouseOutTween = TweenMax.to(button, 0.25, {delay:0.25, rotationX:0, rotationY:0});
});

/*
 Bubble button
*/

menuItem.forEach(function(item, i){
	angle = startingAngle + ( slice * i );
	item.style.transform = "rotate("+(angle)+"deg)";
	item.querySelector(".menu-item-button").style.transform = "rotate("+(-angle)+"deg)"
})

function closeMenuToggle() {
	TweenMax.to( menuToggleIcon, 0.1, {
		scale: 1
	})
}

document.addEventListener('mouseup', closeMenuToggle )

document.addEventListener('touchend', closeMenuToggle )

menuToggleButton.addEventListener('mousedown', pressHandler )
menuToggleButton.addEventListener('touchstart', function(event) {
	pressHandler();
	event.preventDefault();
	event.stopPropagation();
})

function pressHandler(event){
	TweenMax.to( menuToggleIcon, 0.1, {
		scale: 1.5
	})
	on = !on;
	TweenMax.to(menuToggleButton.querySelector('.menu-toggle-icon'),0.4,{
		transformOrigin: "50% 50%",
		rotation: on ? 45 : 0,
		ease:Quint.easeInOut
	});

	on ? openMenu() : closeMenu();
}

function openMenu(){
	menuItem.forEach(function(item, i){
		let delay = i * 0.08;
		let $bounce = item.querySelector(".menu-item-bounce");
		TweenMax.fromTo( $bounce, 0.2, {
			transformOrigin:"50% 50%"
		},{
			delay: delay,
			scaleX: 0.9,
			scaleY: 1.2,
			ease: Quad.easeInOut,
			onComplete: function(){
				TweenMax.to( $bounce, 0.15, {
					scaleY: 0.8,
					ease: Quad.easeInOut,
					onComplete: function(){
						TweenMax.to( $bounce, 3, {
							scaleY: .95,
							scaleX: .95,
							ease: Elastic.easeOut,
							easeParams: [1.1,0.12]
						})
					}
				})
			}
		});
		TweenMax.to(item.querySelector(".menu-item-button"), 0.5, {
			delay: delay,
			y: distance,
			ease: Quint.easeInOut
		});
	})
}

function closeMenu(){
	menuItem.forEach(function(item, i){
		let delay = i * 0.08;
		let $bounce= item.querySelector(".menu-item-bounce");
		TweenMax.fromTo( $bounce, 0.2, {
			transformOrigin:"50% 50%"
		},{
			delay: delay,
			scaleX: 1,
			scaleY: 0.8,
			ease: Quad.easeInOut,
			onComplete: function(){
				TweenMax.to( $bounce, 0.15, {
					scaleY: 1.2,
					ease: Quad.easeInOut,
					onComplete: function(){
						TweenMax.to( $bounce, 3, {
							scaleY: 1,
							ease: Elastic.easeOut,
							easeParams: [1.1,0.12]
						})
					}
				})
			}
		});
		TweenMax.to(item.querySelector(".menu-item-button"), 0.2, {
			delay: delay,
			y: 0,
			ease: Quint.easeIn
		});
	})
}

/*
  Overlay Deadline
*/
function showHidePopup(parent) {
  let item = parent;
  if(document.querySelectorAll('input')[0]){
    document.querySelectorAll('input')[0].focus()
  }

  if(item.getAttribute('data-show') === 'false') {
    TweenMax.to(item, .3, {
      scale: 1,
      opacity: 1,
      ease: Quint.easeOut,
    })
    item.setAttribute('data-show', 'true');
  }
  else if(item.getAttribute('data-show') === 'true') {
    TweenMax.to(item, .3, {
      scale: 0,
      opacity: 0,
      ease: Quint.easeOut,
    })
    item.setAttribute('data-show', 'false');
  }
}

TweenMax.globalTimeScale( 1 )
