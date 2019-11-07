var xhr = new XMLHttpRequest(); //웹사이트의 XML을 요청하여 페이지의 내용를 파싱합니다.
xhr.open('GET', "https://king10tech.github.io"); //메소드와 파싱할 주소를 인자값으로 전달합니다. 이 예제에서는 example.com로 지정했습니다
xhr.send(); //XML 요청을 전송합니다.

xhr.addEventListener('load', function(){
	//XML 요청을 통한 페이지 로드가 완료됐을 때,
	let doc = new DOMParser().parseFromString(xhr.responseText, "text/html"); //XML 요청으로 받아온 HTML 문자열을 DOMParse를 통해 Document로 처리합니다.
	alert(doc.body.innerHTML); //불러온 Element의 body를 다시 innerHTML로 변환하여 웹페이지의 내용(문자열)이 정상적으로 Document 처리됐는지 문자열로 확인합니다.
	doc.getElementsByClassName //가져오고자 하는 Element을 document 처리와 같은 방식(실제로 doc 변수의 인스턴스는 Document로 지정되어 있습니다)으로 불러옵니다.
	
	/*인스턴스가 Document로 지정된 것인지 확인하고자 한다면 다음 주석을 해제해 주세요.
	**; alert(`doc instaceof Document:　${doc instanceof Document}`);
	*/
});