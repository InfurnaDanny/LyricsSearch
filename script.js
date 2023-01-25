const input = document.getElementById('search-input');
const api = "http://api.musixmatch.com/ws/1.1/";
const apiKey = '&apikey=af65078ad17d609e2ed427a0ff0b11ae';
let timeOutId;/* timer per la chiamata dei suggeriti */

input.addEventListener('input', (e)=>{
    e.preventDefault();

    clearTimeout(timeOutId);

    const song = e.target.value;
    const suggest = document.querySelector('.suggest');
    const endPoint = `${api}track.search?q_track_artist=${encodeURIComponent(song)}&page_size=30&page=1&s_track_rating=desc${apiKey}`

    timeOutId = setTimeout(() => {
        fetch(endPoint).then(
            response => {
                if(e.target.value !== ""){
                    return response.json();
                } else suggest.innerHTML = "";
            }
        ).then(
            data => {
                suggest.innerHTML = "" /* pulisco il campo dei suggeriti */
                if(data.message.body.track_list !== undefined){ 
                    suggest.innerHTML += `<div class="suggested_title"><b>Suggeriti:</b></div>`
                    for(i=0; i<data.message.body.track_list.length; i++){
                        if(i<5){
                            const trackName = data.message.body.track_list[i].track.track_name;
                            const artist = data.message.body.track_list[i].track.artist_name;
                            const suggested = `<p class="suggested" onclick="suggested(this)">${artist} - ${trackName}</p>`
        
                            suggest.innerHTML += suggested;
                        } else continue
                    }
                }
        })
    }, 1500);
})

/* Chiamata per il testo */
const submit = document.getElementById('search-form');

submit.addEventListener('submit', (e)=>{
    e.preventDefault();

    let song = e.target[0].value;
    if(song.split('').includes('-')){/* Prendo solo il titolo canzone eliminado l'artista */
        const index = song.split('').indexOf('-');
        songSplitted = song.split('').slice(index+2);
        song = '';
        for(i=0;i<songSplitted.length;i++){
            song += songSplitted[i];    
        }
    }

    const apiRoot = `${api}track.search?q_track=${encodeURIComponent(song)}&page_size=30&page=1&s_track_rating=desc${apiKey}`;

    fetch(apiRoot).then(res => {return res.json()}).then(
        data => {/* Prendo l'id della canzone e lo passo alla chiamata per le lyrics */
            let id = data.message.body.track_list[0].track.track_id;
            getLyrics(id);
        }
    )
})

function suggested(e){
    input.value = e.textContent;
}

function getLyrics(id){/* Fornisco le lyrics */
    let apiLyrics = `${api}track.lyrics.get?track_id=${id}${apiKey}`

    fetch(apiLyrics).then(res => {
        showLyricsLoader();
        return res.json()
    }).then(
        data => {
            scrollToLyricsResult();
            let divLyrics = document.getElementById('lyrics-results'); 
            /* Inietto le lyrics nella pagina */
            divLyrics.innerHTML = `<p class="lyrics">${data.message.body.lyrics.lyrics_body}<p>`;
        }
    ).catch(err => showLyricsError())
}