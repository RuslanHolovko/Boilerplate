import $ from 'jquery';
import TweenMax from "gsap";
import testfunc from './testfunc'

// To see the jquery in the console
window.jQuery = $;
window.$ = $;


var tl = new TimelineMax();

tl.fromTo('.anim', 10, {x : '0px'}, {x: '500px', ease: Expo.easeOut})

console.log('fdvjafjvbaldjbvlkadjbfvladjbv');
// $('header').hide();
// setTimeout(function(){
//     $('header').show();
// },500)

$('body').css({'background' : 'purple'});

testfunc();
    