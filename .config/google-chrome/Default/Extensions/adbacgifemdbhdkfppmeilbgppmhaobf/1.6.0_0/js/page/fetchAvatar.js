function stripTags(s) {
	if (typeof s == "undefined") {
		return s
	}
	return s.replace(/(<([^>]+)>)/gi, "").replace(/</g, "").replace(/>/g, "").replace(/'/g, "").replace(/"/g, "").replace(/`/g, "");
 }

var assetTypeMapping = {"Image": 1, "TShirt": 2, "Audio": 3, "Mesh": 4, "Lua": 5, "Hat": 8, "Place": 9, "Model": 10, "Shirt": 11, "Pants": 12, "Decal": 13, "Head": 17, "Face": 18, "Gear": 19, "Badge": 21, "Animation": 24, "Torso": 27, "RightArm": 28, "LeftArm": 29, "LeftLeg": 30, "RightLeg": 31, "Package": 32, "GamePass": 34, "Plugin": 38, "MeshPart": 40, "HairAccessory": 41, "FaceAccessory": 42, "NeckAccessory": 43, "ShoulderAccessory": 44, "FrontAccessory": 45, "BackAccessory": 46, "WaistAccessory": 47, "ClimbAnimation": 48, "DeathAnimation": 49, "FallAnimation": 50, "IdleAnimation": 51, "JumpAnimation": 52, "RunAnimation": 53, "SwimAnimation": 54, "WalkAnimation": 55, "PoseAnimation": 56, "EarAccessory": 57, "EyeAccessory": 58, "EmoteAnimation": 61, "Video": 62, "TShirtAccessory": 64, "ShirtAccessory": 65, "PantsAccessory": 66, "JacketAccessory": 67, "SweaterAccessory": 68, "ShortsAccessory": 69, "LeftShoeAccessory": 70, "RightShoeAccessory": 71, "DressSkirtAccessory": 72}

document.addEventListener('unequipItem', function(event) {
	itemJSON = {
		"id": parseInt(event.detail.id),
		"name": "",
		"type": "Asset",
		"assetType": {
			"id": 18,
			"name": "Hat"
		},
		"thumbnail": {
			"Final": false,
			"Url": ""
		},
		"thumbnailType": "Asset",
		"link": "",
		"selected": true
	}
	angular.element(document.getElementById('UserAvatar')).scope().onItemClicked(itemJSON, new Event('unequip'))
})

document.addEventListener('equipItem', function(event) {
	itemJSON = {
		"id": parseInt(event.detail.id),
		"name": "",
		"type": "Asset",
		"assetType": {
			"id": parseInt(assetTypeMapping[event.detail.assetTypeName]),
			"name": stripTags(event.detail.assetTypeName)
		},
		"thumbnail": {
			"Final": false,
			"Url": ""
		},
		"thumbnailType": "Asset",
		"link": "",
		"selected": false
	}
	angular.element(document.getElementById('UserAvatar')).scope().onItemClicked(itemJSON, new Event('equip'))
})

document.addEventListener('reloadAvatar', function(event) {
	angular.element(document.getElementById('UserAvatar')).scope().redrawThumbnail()
})

document.addEventListener('setScales', function(event) {
	angular.element(document.getElementById('proportions-scale')).scope().$parent.$parent.scales.height.value = event.detail.height
	angular.element(document.getElementById('proportions-scale')).scope().$parent.$parent.scales.width.value = event.detail.width
	angular.element(document.getElementById('proportions-scale')).scope().$parent.$parent.scales.proportion.value = event.detail.proportion
	angular.element(document.getElementById('proportions-scale')).scope().$parent.$parent.scales.bodyType.value = event.detail.bodyType
	angular.element(document.getElementById('proportions-scale')).scope().$parent.$parent.scales.head.value = event.detail.head
	angular.element(document.getElementById('proportions-scale')).scope().$parent.$parent.updateScales()
})