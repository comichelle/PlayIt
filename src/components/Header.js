import React from 'react';
import $ from 'jquery';

export default function Header() {

//Smooth Scroll
function scroll() {
	 $('html, body').animate({
          scrollTop: $('#events').offset().top
        }, 600);
}
	return (
		<header>
			<div className="header_wrapper">
				<div className="headers">
					<h1>PLAYIT</h1>
					<p>Pick the event you are attending and PlayIt will generate a customized playlist that you can listen to on your special event.</p>
					<button id="letsListen" onClick={scroll}>Let's Listen Now</button>
					<p className="note">*PlayIt works best when spotify is open</p>
				</div>
			</div>
		</header>
	)
}