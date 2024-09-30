
function elementFromHtml(html) {
    const template = document.createElement("template");

    template.innerHTML = html.trim();
    
    return template.content.firstElementChild;
}

function printList() {
 
    //This adds options to the drop down menu displaying the possible graphs
    //it takes an array list and makes them into html elements before
    //appending them to the menu dropdownmenu id'd element. 
    const graphs = ["Presidential Election", "Club Co-President", "Leadership Position", "Policy Group A"];

    for(let i =1; i<graphs.length; i++) {
        let lah = "<li>" + graphs[i] + "</li>";
        const list = elementFromHtml(lah);
        document.getElementById("dropdownmenu").appendChild(list);
    }
    let lah = '<li class="active">' + graphs[0] + "</li>";
    const list = elementFromHtml(lah);
    document.getElementById("dropdownmenu").appendChild(list);
    
    document.getElementById("selectedId").innerHTML = graphs[0];
    
}

window.onload = (event) => {
    const ctx = document.getElementById('barChart');
    const c2tx = document.getElementById('doughnutChart');
    createGraph(ctx, c2tx, 'bar', 'doughnut', "0e1748f4c7d7cf7a973e6c5772e7dc845deb52c094df7ab764da110a9b765045.txt");  
};

const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach(dropdown => {
    printList();
    const select = dropdown.querySelector('.select');
    const caret = dropdown.querySelector('.caret');
    const menu = dropdown.querySelector('.menu');
    const options = dropdown.querySelectorAll('.menu li');
    const selected = dropdown.querySelector('.selected');

    select.addEventListener('click', () => {
    select.classList.toggle('select-clicked');

    caret.classList.toggle('caret-rotate');

    menu.classList.toggle('menu-open');
    });

    options.forEach(option => {
        option.addEventListener('click', async () => {
            selected.innerText = option.innerText;
            let nm = await sha256(selected.innerText) + ".txt";

            const ctx = document.getElementById('barChart');
            const c2tx = document.getElementById('doughnutChart'); 

            createGraph(ctx, c2tx, 'bar', 'doughnut', nm);

            select.classList.remove('select-clicked');

            caret.classList.remove('caret-rotate');

            menu.classList.remove('menu-open');

            options.forEach(option => {
                option.classList.remove('active');
            });

            option.classList.add('active');
        });
    });
});

async function sha256(graphName) {
  const encoder = new TextEncoder();
  const data = encoder.encode(graphName);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

let mychart1, mychart2;
//seperate options with symbol and then split it for the data
function createGraph(ctx, c2tx, type, type2, file) {
    
    if(mychart1) {
        mychart1.destroy();
    }
    if(mychart2) {
        mychart2.destroy()
    }

    fetch(file)
        .then(response => response.text())
        .then(text => {
            let split1 = text.split("\n");
            const split2 = [];
            document.getElementById('startToEndText').innerHTML = split1[0];
            for(let i = 1; i<split1.length; i++) {
                split2.push(split1[i].split(":"));
            }

            let optionNames = [], optionNumbers = [];
            
            for(let i =0; i<split2.length; i++) {
                optionNames.push(split2[i][0]);
                optionNumbers.push(split2[i][1]);
            }
            

            mychart1 = new Chart(ctx, {
                type: type,
                data: {
                labels: optionNames,
                datasets: [{
                    label: '# of Votes',
                    data: optionNumbers,
                    borderWidth: 1
                }]
                },
                options: {
                scales: {
                    y: {
                    beginAtZero: true
                    }
                }
                }
            });

            mychart2 = new Chart(c2tx, {
                type: type2,
                data: {
                labels: optionNames,
                datasets: [{
                    label: '# of Votes',
                    data: optionNumbers,
                    borderWidth: 1
                }]
                },
                options: {
                scales: {
                    y: {
                    beginAtZero: true
                    }
                }
                }
            });
    });
}
/*
const ctx = document.getElementById('barChart');
const c2tx = document.getElementById('doughnutChart');
createGraph(ctx, 'bar');
createGraph(c2tx, 'doughnut');*/

console.log(sha256("Leadership Position"));
console.log(sha256("Policy Group A"));

//ended off with problem when switching from one type of graph to the next when clicking menu option.



  