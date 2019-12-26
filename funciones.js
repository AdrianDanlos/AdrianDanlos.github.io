$( document ).ready(function() {
    let api = 'https://cors-anywhere.herokuapp.com/https://api.mozambiquehe.re/bridge?platform=PC&player=N3Essential,N3EssentialSmurf,EssentialReborn,spacexfanboy,asiatristanvigo,thechinesesoul,thekoreansoul&auth=';
    let key = 'LPuQwxrvLY7hspWf1eST';

    //First call
    ajaxCall();
    //Repetitive calls each minute
    setInterval(()=>{
        ajaxCall();
    }, 60000); //1min


    function ajaxCall(){
        $.ajax({
            url: api + key,
            contentType: "application/json",
            dataType: 'json',
            success: function(result){
                $('#loading-logo').remove();
                let online = isOnline(result);
                let datosRanking = getRanking(result);
                let datosTotales = sumarDatos(result);
                visualizarDatos(datosTotales, datosRanking, online, "N3Essential");
                console.log(result);
            }
        });
    }

    function isOnline(result) {
        let online = false;
        result.forEach((item, index) => {
            if(result[index]['realtime']['isOnline'] === 1){
                online = true;
            }
        });
        return online;
    }

    function getRanking(result){
        let rankObject = result[0]['global']['rank'];
        let rankName = rankObject['rankName'];
        let rankScore = rankObject['rankScore'];
        let rankDiv = rankObject['rankDiv'];
        let rankImg = rankObject['rankImg'];

        return [rankName, rankDiv, rankScore, rankImg];
    }

    function sumarDatos(result){
        let datosTotales = {
            "kills": 0,
            "wins": 0,
            "top3": 0
        };
        //get stats from selected legend
        result.forEach((item, i) => {
            const selectedLegend = Object.values(result[i]['legends']['selected'])[0]; //constante dado que nunca le vamos a asignar otro valor durante la iteración actual. La volvemos a declarar en cada iteración.

            datosTotales.kills += selectedLegend['kills'] || 0;
            datosTotales.wins += selectedLegend['wins_season_3'] || 0;
            datosTotales.top3 += selectedLegend['top_3'] || 0;
            /*console.log('--------------SELECTED LEGEND-------------');
            console.log('Account number: ' + i);
            console.log('Selected legend: ' + Object.keys(result[i]['legends']['selected'])[0]);
            console.log('Kills: ' + selectedLegend['kills']);
            console.log('Wins: ' + selectedLegend['wins_season_3']);
            console.log('Top3: ' + selectedLegend['top_3']);
            console.log('Total Kills: ' + datosTotales.kills);
            console.log('Total wins: ' + datosTotales.wins);
            console.log('Total top3: ' + datosTotales.top3);*/
        });

        //get stats from all legends except the selected one to avoid duplicated data
        result.forEach((item, i)=>{ //iterate trough accounts
            let selectedLegendKey = Object.keys(result[i]['legends']['selected'])[0]; //legend selected in this account
            let allLegendsArray = result[i]['legends']['all']; //all legends array
            if(allLegendsArray){ //if the api gets 'all legends' object
                /*console.log('-------------ALL LEGENDS--------------');
                console.log('Account number: ' + i);*/
                Object.keys(allLegendsArray).forEach((key, x)=> { //iterate through 'all' legends
                    if(selectedLegendKey !== Object.keys(allLegendsArray)[x]){ //we keep adding data except if the legend found in 'all legends' section is the selected one.
                        let iteratingLegend = Object.values(allLegendsArray)[x]; //the legend we are iterating trhough
                        datosTotales.kills += parseInt(iteratingLegend['kills'], 10);
                        datosTotales.wins += parseInt(iteratingLegend['wins_season_3'], 10) || 0;
                        datosTotales.top3 += parseInt(iteratingLegend['top_3'], 10) || 0;
                        /*console.log('current legend in iteration: ' + Object.keys(allLegendsArray)[x]);
                        console.log('kills: ' + iteratingLegend['kills']);
                        console.log('Total Kills: ' + datosTotales.kills);*/
                    }
                });
            }
        });
        return datosTotales;
    }

    function visualizarDatos(datosTotales, datosRanking, online, user) {
        //Date
        createDateNode();
        //User
        $('#user-info').html(user);
        //Data
        let dataContainers = $('.data');
        for (let i = 0; i < dataContainers.length; i++) {
            dataContainers[i].innerHTML = datosTotales[Object.keys(datosTotales)[i]];
        }
        //Ranking
        $('#rank').html(datosRanking[0] + " " + romanize(datosRanking[1]) + " " + datosRanking[2]);
        $('.rank-logo').attr('src', datosRanking[3]);
        //Online status up
        if(online){
            $('#online-logo').attr('src', 'img/online.png');
        }
        else{
            $('#online-logo').attr('src', 'img/offline.png');
        }
    }

    function romanize(number) {
        switch (number) {
            case 1: return 'I';
                break;
            case 2: return 'II';
                break;
            case 3: return 'III';
                break;
            case 4: return 'IV';
                break;
        }
    }

    function createDateNode() {
        let d = new Date();
        let refreshTime = $('#refresh-time');
        if(!refreshTime.length){
            $('footer').prepend('<span id="refresh-time"></span>');
            refreshTime = $('#refresh-time');
        }
        refreshTime.html("Last refresh: " + (d.getHours()<10?'0':'') + d.getHours() + ' : ' + (d.getMinutes()<10?'0':'') + d.getMinutes() + ' : ' + (d.getSeconds()<10?'0':'') + d.getSeconds() + '  GMT+1');
    }
});
