//MUST HAVES:
//User picks an event
/*---------------------
Getting Hitched
COcktail Party
Girls night In
Poker Night
Outdoor Adventure
----------------------*/

//Get to Spotify and get the artists for chisen event
//With the IDs generate a list of Albums
// User picks button/Album
//Then get tracks from album to put in a new playlist
//or User picks Album(Genre) and a playlist is created

import React from 'react';
import ReactDOM from 'react-dom';
import { ajax, when } from 'jquery';
import Header from './components/Header';
import Footer from './components/Footer';
import _ from 'underscore';

const client_id = '5e286f58723c401eb4fb9b4773148424'; 
const client_secret = '5be790bb72a5433ba5b69bd02751dfd3'; 

const spotifyUrl = 'https://api.spotify.com/v1';

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			artistInfo: [],
			playlist: [],
			finalPlaylist: [],
			showSection: false,
			choice: '',
		}
		this.getArtists = this.getArtists.bind(this);
		this.getAlbumsByIds = this.getAlbumsByIds.bind(this);
		this.getArtistTracks = this.getArtistTracks.bind(this);
		this.buildPlaylist = this.buildPlaylist.bind(this);
	}

	//this function will pull artists from spotify that are associated with the event button user chose. 
	getArtists(e, type) {
		e.preventDefault();
		this.setState({
			showSection: true
		});
		console.log(this.state.showSection)
		const events = {
			'Getting Hitched': ['nat king cole', 'ed sheeran', 'seal', 'barbra streisand', 'celine dion'],
			'Poker Night': ['the weeknd', 'drake', 'jimmy eat world', 'the rolling stones', 'the notorious b.i.g'],
			'Cocktail Party': ['tony bennett', 'denis solee', 'beegie adair', 'michael buble'],
			'Girls Night': ['gwen stefani', 'beyonce', 'spice girls', 'mariah carey', 'shania twain'],
			'Outdoor Adventures': ['coldplay', 'bee gees', 'david bowie', 'missy elliott', 'adele']
		}
		// console.log("button works")
		// this.setState({ choice: e.target.value });
		this.setState({ choice: type });

		// console.log(events)

		//get the keys
		// const selected = events[e.target.value];
		const selected = events[type];
		// console.log(selected) 

		const getFirstElement = (item) => item[0];
	
		let artistInfo = [];

		//Looping over the array 
		//Get the Artist and then the Artists IDs
		artistInfo = selected.map((artistName) => {
			return ajax({
				url: `${spotifyUrl}/search`,
				method: 'GET',
				dataType: 'json',
				data: {
					q: artistName,
					type: 'artist',
					limit: 20
				}
			});		
		});
		//when() to wait for the calls to come back and then spread out each elements from the array
		when(...artistInfo)
			.done((...promises) => { //this will gather up all the returned things
				// console.log(promises); here we will see the array 
				// now map out the artists
				let artists = promises.map((promise) => {
					return { 
						name: promise[0].artists.items[0].name,
						id: promise[0].artists.items[0].id 
					}
				});
				// console.log(artists); // SHOWS ARTIST NAME AND ID //
				//albums called here
				artists = artists.map((individualArtist) => {
					//returning artist albums from ajax call of getAlbumsByIds()
					return this.getAlbumsByIds(individualArtist)
				});
				when(...artists)
					.done((...artistAlbums) => {
					// console.log(artistAlbums); // SHOWS All ARTISTS ALBUMS //

						//getting the artist album IDs
						artistAlbums = artistAlbums.map(getFirstElement)
							.map((res, i) => { 
								if (i < 10) {
									return res.items[0].id
								}
							})
				});
				//Retrieve Artist
				when(...artists)
					.done((...albums) => {
						albums = albums.map(getFirstElement)
							.map(res => res.items)
							// taking arrays and flattening and concatinating them
							.reduce((prev, curr) => [...prev,...curr], [])
							//.map() will get us the id of the album
							.map(album => album.id)
							// console.log(albums); //SHOW ARRAY OF JUST ALL THE ID/ITEMS

							///GETTING TRACKS
							// .map(id => this.getArtistTracks(id))
							albums = albums.map((individualAlbums) => {

								// if (i < 10) {
									return this.getArtistTracks(individualAlbums);
								// }
								// console.log(albums);
							})
							when(...albums)
								.then((...tracksResults) => {
									let albumList = tracksResults.map(getFirstElement)
									.map(item => item.items)
									// console.log(albumList)
									albumList.map((album) => {
										album.map((track) => {
											// console.log(track)
											//Here I am just getting the track IDs
											let newPlaylist = [...this.state.playlist, track.id ];
											this.setState({
												playlist: newPlaylist
											});
										});
									});
									//this shuffles the array of tracks to randomize the order of artists and then sliced to 15 tracks instead of hundreds.
									let shuffledArray = _.shuffle(this.state.playlist);
									const slicedAlbums = shuffledArray.slice(0, 16);
									// console.log(slicedAlbums.length)
									// slicedAlbums.push(this.state.finalPlaylist)
									//15 tracks picked and generated in a playlist
									this.setState({finalPlaylist: slicedAlbums});
								});
					});
			});
	};

	//Get artists albums
	getAlbumsByIds(artists) {
		// let artistIds = artists.map((artist) => { 
				return ajax({
					url: `${spotifyUrl}/artists/${artists.id}/albums`,
					method: 'GET',
					dataType: 'json',
					data: {
						album_type: 'album'
					}
				});
	}

	//Get Artists Tracks
	getArtistTracks(id) {
		return ajax({
			url: `${spotifyUrl}/albums/${id}/tracks`,
			method: 'GET',
			dataType: 'json',
			data: {
				album_type: 'album'
			}
		});
	}

	//Build custom playlist according to users event choice. 
	buildPlaylist() {
		const finalPlaylist = this.state.finalPlaylist.join();
		// console.log(this.state.finalPlaylist)
		// const loader = this.state.loader.show();
		return `https://embed.spotify.com/?uri=spotify:trackset:${this.state.choice}:${finalPlaylist}`;

		
	};

	show() {
		return(
		
			<section className="play">
				<div className="wrapper display">
					<div className="never">
						<h1 className="discover">Never stop listening and discover more</h1>
						<h2 className="thankyou">Thank you for using PlayIt</h2>
					</div>
					<div className="playlist">
						<img src="public/images/iphone01.png" className="iphone" />					
						
						{ // TERNERY OPERATOR
							this.state.finalPlaylist.length >= 16 ?
	                    		<iframe src={this.buildPlaylist()} height="400" frameBorder="0" allowTransparency="true" />
	                    		:
	                    		null
						}
					</div>
				</div>
			</section>
	
		)
	}


	render() {
		return (
		<main>
			{/** Header Section **/}
			<Header />

			{/** What kind of Event Section **/}
			<section id="events">
				<div className="wrapper">
					<h3>What kind of event?</h3>
					<form>
						<button id="wedding"  name='events' onClick={e => { this.getArtists(e, 'Getting Hitched'); }}>Getting Hitched</button>

						<button id="pokernight" name='events'  value="pokernight" onClick={e => { this.getArtists(e, 'Poker Night'); }}>Poker Night</button>
		
						<button id="cocktail" name='events' value="cocktail" onClick={e => { this.getArtists(e, 'Cocktail Party'); }}>Cocktail Party</button>

						<button id="girlsnight" name='events'  value="girlsnight" onClick={e => { this.getArtists(e, 'Girls Night'); }}>Girls night</button>

						<button id="outdoor" name='events'  value="outdoor" onClick={e => { this.getArtists(e, 'Outdoor Adventures'); }}>Outdoor Adventures</button>
					</form>
				</div>
			</section>

			{/** Playlist Generator **/}
			{this.state.showSection === true ? this.show() : null}

			{/** Footer Section **/}
			<Footer />
		</main>	
		)
	}
}

ReactDOM.render(<App />, document.getElementById('app'));