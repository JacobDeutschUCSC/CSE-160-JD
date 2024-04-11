function main() {
	// Retrieve <canvas> element								   <- (1)
	var canvas = document.getElementById('example');
	if (!canvas) {
		console.log('Failed to retrieve the <canvas> element');
		return;
	}

	// Get the rendering context for 2DCG						  <- (2)
	var ctx = canvas.getContext('2d');

	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawVector(v, color) {
	var canvas = document.getElementById('example');
	if (!canvas) {
		console.log('Failed to retrieve the <canvas> element');
		return;
	}
	var ctx = canvas.getContext('2d');

	var oX = ctx.canvas.width / 2;
	var oY = ctx.canvas.height / 2;

	var eX = oX + v.elements[0] * 20;
	var eY = oY - v.elements[1] * 20;

	ctx.beginPath();
	ctx.moveTo(oX, oY);
	ctx.lineTo(eX, eY);
	ctx.strokeStyle = color;
	ctx.lineWidth = 1;
	ctx.stroke();
}

function angleBetween(v1, v2) {
	let dotProduct = Vector3.dot(v1, v2);
	let magnitudeV1 = v1.magnitude();
	let magnitudeV2 = v2.magnitude();

	let cA = dotProduct / (magnitudeV1 * magnitudeV2);
	
	let r = Math.acos(cA);
	let degrees = r * (180 / Math.PI);

	return Math.round(degrees*100) / 100;
}

function areaTriangle(v1, v2) {
	var crossProduct = Vector3.cross(v1, v2);
	var p = crossProduct.magnitude();
	var area = p / 2;

	return area;
}

function handleDrawEvent() {
	var canvas = document.getElementById('example');
	if (!canvas) {
		console.log('Failed to retrieve the <canvas> element');
		return;
	}
	var ctx = canvas.getContext('2d');

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	var vX_a = parseFloat(document.getElementById('vX_a').value);
	var vY_a = parseFloat(document.getElementById('vY_a').value);

	var vX_b = parseFloat(document.getElementById('vX_b').value);
	var vY_b = parseFloat(document.getElementById('vY_b').value);

	var custom_v_a = new Vector3([vX_a, vY_a, 0]);
	var custom_v_b = new Vector3([vX_b, vY_b, 0]);

	drawVector(custom_v_a, 'red');
	drawVector(custom_v_b, 'blue');
}

function handleDrawEvent_math() {
	var canvas = document.getElementById('example');
	if (!canvas) {
		console.log('Failed to retrieve the <canvas> element');
		return;
	}
	var ctx = canvas.getContext('2d');

	var vX_a = parseFloat(document.getElementById('vX_a').value);
	var vY_a = parseFloat(document.getElementById('vY_a').value);

	var vX_b = parseFloat(document.getElementById('vX_b').value);
	var vY_b = parseFloat(document.getElementById('vY_b').value);

	var custom_v_mathed_a = new Vector3([vX_a, vY_a, 0]);
	var custom_v_mathed_b = new Vector3([vX_b, vY_b, 0]);


	var selected_math = document.getElementById('math_options').value;
	var scalar = parseFloat(document.getElementById('scalar').value);
	
	if (selected_math == 'Add'){
		custom_v_mathed_a.add(custom_v_mathed_b);
		handleDrawEvent()
		drawVector(custom_v_mathed_a, 'green');
	}
	else if (selected_math == 'Subtract'){
		custom_v_mathed_a.sub(custom_v_mathed_b);
		handleDrawEvent()
		drawVector(custom_v_mathed_a, 'green');
	}
	else if (selected_math == 'Multiply'){
		custom_v_mathed_a.mul(scalar);
		custom_v_mathed_b.mul(scalar);
		handleDrawEvent()
		drawVector(custom_v_mathed_a, 'green');
		drawVector(custom_v_mathed_b, 'green');
	}
	else if (selected_math == 'Divide'){
		custom_v_mathed_a.div(scalar);
		custom_v_mathed_b.div(scalar);
		handleDrawEvent()
		drawVector(custom_v_mathed_a, 'green');
		drawVector(custom_v_mathed_b, 'green');
	}
	else if (selected_math == 'Magnitude'){
		handleDrawEvent()
		console.log("Magnitude v1: ", custom_v_mathed_a.magnitude());
		console.log("Magnitude v1: ", custom_v_mathed_b.magnitude());
	}
	else if (selected_math == 'Normalize'){
		custom_v_mathed_a.normalize();
		custom_v_mathed_b.normalize();
		handleDrawEvent()
		drawVector(custom_v_mathed_a, 'green');
		drawVector(custom_v_mathed_b, 'green');
	}
	else if (selected_math == 'Angle_Between'){
		handleDrawEvent()
		console.log("Angle: ", angleBetween(custom_v_mathed_a, custom_v_mathed_b))
	}
	else if (selected_math == 'Area'){
		handleDrawEvent()
		console.log("Area of the triangle: ", areaTriangle(custom_v_mathed_a, custom_v_mathed_b))
	}
}



