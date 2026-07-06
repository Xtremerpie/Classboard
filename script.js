let files = JSON.parse(localStorage.getItem("classboard")) || [];

const uploadBtn = document.getElementById("uploadBtn");

const fileInput = document.getElementById("fileInput");

const fileList = document.getElementById("fileList");

const searchBox = document.getElementById("searchBox");

function saveFiles(){

localStorage.setItem("classboard",JSON.stringify(files));

}

function renderFiles(){

fileList.innerHTML="";
window.open(file.url)
const keyword=searchBox.value.toLowerCase();

files.forEach((file,index)=>{

if(file.name.toLowerCase().includes(keyword)){

fileList.innerHTML+=`

<div class="file">

<div class="file-name">

📄 ${file.name}

</div>

<div class="buttons">

<button class="download" onclick="downloadFile(${index})">

Download

</button>

<button class="delete" onclick="deleteFile(${index})">

Delete

</button>

</div>

</div>

`;

}

});

}

uploadBtn.onclick=function(){

const file=fileInput.files[0];

if(!file){

alert("Please select a file.");

return;

}

const reader=new FileReader();

reader.onload=function(e){

files.push({

name:file.name,

data:e.target.result

});

saveFiles();

renderFiles();

fileInput.value="";

}

reader.readAsDataURL(file);

}

function downloadFile(index){

const a=document.createElement("a");

a.href=files[index].data;

a.download=files[index].name;

a.click();

}

function deleteFile(index){

if(confirm("Delete this file?")){

files.splice(index,1);

saveFiles();

renderFiles();

}

}

searchBox.oninput=function(){

renderFiles();

}

renderFiles();