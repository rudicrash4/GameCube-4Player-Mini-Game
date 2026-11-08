// Auto-generated JS asset wrappers to avoid browser JSON module MIME / import assertion incompatibilities
export const modelJson = {
	"format_version": "1.12.0",
	"minecraft:geometry": [
		{
			"description": {
				"identifier": "geometry.unknown",
				"texture_width": 64,
				"texture_height": 64,
				"visible_bounds_width": 3,
				"visible_bounds_height": 3.5,
				"visible_bounds_offset": [0, 1.25, 0]
			},
			"bones": [
				{
					"name": "Waist",
					"pivot": [0, 12, 0]
				},
				{
					"name": "Head",
					"parent": "Waist",
					"pivot": [0, 25, 0],
					"rotation": [1.5, 5, 0],
					"cubes": [
						{
							"origin": [-5, 24, -5],
							"size": [10, 10, 10],
							"uv": {
								"north": {"uv": [8, 8], "uv_size": [8, 8]},
								"east": {"uv": [0, 8], "uv_size": [8, 8]},
								"south": {"uv": [24, 8], "uv_size": [8, 8]},
								"west": {"uv": [16, 8], "uv_size": [8, 8]},
								"up": {"uv": [8, 0], "uv_size": [8, 8]},
								"down": {"uv": [16, 8], "uv_size": [8, -8]}
							}
						},
						{
							"origin": [-5, 24, -5],
							"size": [10, 10, 10],
							"inflate": 0.5,
							"uv": {
								"north": {"uv": [40, 8], "uv_size": [8, 8]},
								"east": {"uv": [32, 8], "uv_size": [8, 8]},
								"south": {"uv": [56, 8], "uv_size": [8, 8]},
								"west": {"uv": [48, 8], "uv_size": [8, 8]},
								"up": {"uv": [40, 0], "uv_size": [8, 8]},
								"down": {"uv": [48, 8], "uv_size": [8, -8]}
							}
						}
					]
				},
				{
					"name": "Body",
					"parent": "Waist",
					"pivot": [0, 24, 0],
					"cubes": [
						{
							"origin": [-4, 12, -2],
							"size": [8, 12, 4],
							"uv": {
								"north": {"uv": [20, 20], "uv_size": [8, 12]},
								"east": {"uv": [16, 20], "uv_size": [4, 12]},
								"south": {"uv": [32, 20], "uv_size": [8, 12]},
								"west": {"uv": [28, 20], "uv_size": [4, 12]},
								"up": {"uv": [20, 16], "uv_size": [8, 4]},
								"down": {"uv": [28, 20], "uv_size": [8, -4]}
							}
						},
						{
							"origin": [-4, 12, -2],
							"size": [8, 12, 4],
							"inflate": 0.25,
							"uv": {
								"north": {"uv": [20, 36], "uv_size": [8, 12]},
								"east": {"uv": [16, 36], "uv_size": [4, 12]},
								"south": {"uv": [32, 36], "uv_size": [8, 12]},
								"west": {"uv": [28, 36], "uv_size": [4, 12]},
								"up": {"uv": [20, 32], "uv_size": [8, 4]},
								"down": {"uv": [28, 36], "uv_size": [8, -4]}
							}
						}
					]
				},
				{
					"name": "Right Arm",
					"parent": "Body",
					"pivot": [-5, 22, 0],
					"rotation": [0, 0, 5],
					"cubes": [
						{
							"origin": [-8, 12, -2],
							"size": [4, 12, 4],
							"uv": {
								"north": {"uv": [44, 20], "uv_size": [4, 12]},
								"east": {"uv": [40, 20], "uv_size": [4, 12]},
								"south": {"uv": [52, 20], "uv_size": [4, 12]},
								"west": {"uv": [48, 20], "uv_size": [4, 12]},
								"up": {"uv": [44, 16], "uv_size": [4, 4]},
								"down": {"uv": [48, 20], "uv_size": [4, -4]}
							}
						},
						{
							"origin": [-8, 12, -2],
							"size": [4, 12, 4],
							"inflate": 0.25,
							"uv": {
								"north": {"uv": [44, 36], "uv_size": [4, 12]},
								"east": {"uv": [40, 36], "uv_size": [4, 12]},
								"south": {"uv": [52, 36], "uv_size": [4, 12]},
								"west": {"uv": [48, 36], "uv_size": [4, 12]},
								"up": {"uv": [44, 32], "uv_size": [4, 4]},
								"down": {"uv": [48, 36], "uv_size": [4, -4]}
							}
						}
					]
				},
				{
					"name": "Left Arm",
					"parent": "Body",
					"pivot": [5, 22, 0],
					"rotation": [0, 0, -5],
					"cubes": [
						{
							"origin": [4, 12, -2],
							"size": [4, 12, 4],
							"uv": {
								"north": {"uv": [36, 52], "uv_size": [4, 12]},
								"east": {"uv": [32, 52], "uv_size": [4, 12]},
								"south": {"uv": [44, 52], "uv_size": [4, 12]},
								"west": {"uv": [40, 52], "uv_size": [4, 12]},
								"up": {"uv": [36, 48], "uv_size": [4, 4]},
								"down": {"uv": [40, 52], "uv_size": [4, -4]}
							}
						},
						{
							"origin": [4, 12, -2],
							"size": [4, 12, 4],
							"inflate": 0.25,
							"uv": {
								"north": {"uv": [52, 52], "uv_size": [4, 12]},
								"east": {"uv": [48, 52], "uv_size": [4, 12]},
								"south": {"uv": [60, 52], "uv_size": [4, 12]},
								"west": {"uv": [56, 52], "uv_size": [4, 12]},
								"up": {"uv": [52, 48], "uv_size": [4, 4]},
								"down": {"uv": [56, 52], "uv_size": [4, -4]}
							}
						}
					]
				},
				{
					"name": "Right Leg",
					"pivot": [-1.9, 12, 0],
					"rotation": [0, 0, 2],
					"cubes": [
						{
							"origin": [-3.9, 0, -2],
							"size": [4, 12, 4],
							"uv": {
								"north": {"uv": [4, 20], "uv_size": [4, 12]},
								"east": {"uv": [0, 20], "uv_size": [4, 12]},
								"south": {"uv": [12, 20], "uv_size": [4, 12]},
								"west": {"uv": [8, 20], "uv_size": [4, 12]},
								"up": {"uv": [4, 16], "uv_size": [4, 4]},
								"down": {"uv": [8, 20], "uv_size": [4, -4]}
							}
						},
						{
							"origin": [-3.9, 0, -2],
							"size": [4, 12, 4],
							"inflate": 0.25,
							"uv": {
								"north": {"uv": [4, 36], "uv_size": [4, 12]},
								"east": {"uv": [0, 36], "uv_size": [4, 12]},
								"south": {"uv": [12, 36], "uv_size": [4, 12]},
								"west": {"uv": [8, 36], "uv_size": [4, 12]},
								"up": {"uv": [4, 32], "uv_size": [4, 4]},
								"down": {"uv": [8, 36], "uv_size": [4, -4]}
							}
						}
					]
				},
				{
					"name": "Left Leg",
					"pivot": [1.9, 12, 0],
					"rotation": [0, 0, -2],
					"cubes": [
						{
							"origin": [-0.1, 0, -2],
							"size": [4, 12, 4],
							"uv": {
								"north": {"uv": [20, 52], "uv_size": [4, 12]},
								"east": {"uv": [16, 52], "uv_size": [4, 12]},
								"south": {"uv": [28, 52], "uv_size": [4, 12]},
								"west": {"uv": [24, 52], "uv_size": [4, 12]},
								"up": {"uv": [20, 48], "uv_size": [4, 4]},
								"down": {"uv": [24, 52], "uv_size": [4, -4]}
							}
						},
						{
							"origin": [-0.1, 0, -2],
							"size": [4, 12, 4],
							"inflate": 0.25,
							"uv": {
								"north": {"uv": [4, 52], "uv_size": [4, 12]},
								"east": {"uv": [0, 52], "uv_size": [4, 12]},
								"south": {"uv": [12, 52], "uv_size": [4, 12]},
								"west": {"uv": [8, 52], "uv_size": [4, 12]},
								"up": {"uv": [4, 48], "uv_size": [4, 4]},
								"down": {"uv": [8, 52], "uv_size": [4, -4]}
							}
						}
					]
				}
			]
		}
	]
};
export const animIdleJson = {
	"format_version": "1.8.0",
	"animations": {
		"animation.actor.idle": {
			"loop": "hold_on_last_frame",
			"bones": {
				"Waist": {
					"position": [0, "math.cos(query.life_time*245)*0.15-0.15", 0]
				},
				"Head": {
					"rotation": ["math.sin(query.life_time*245+25)*-2.75", 0, "math.cos(query.life_time*122.5)*-2.5"]
				},
				"root": {
					"position": ["math.sin(query.life_time*122.5)*0.25", 0, 0]
				},
				"Right Arm": {
					"rotation": [0, 0, "math.sin(query.life_time*245)*1.25+1.15"],
					"position": [0, "math.cos(query.life_time*245)*0.1+0.05", 0]
				},
				"Left Arm": {
					"rotation": [0, 0, "math.sin(query.life_time*245)*-1.25-1.15"],
					"position": [0, "math.cos(query.life_time*245)*0.1+0.05", 0]
				},
				"Right Leg": {
					"rotation": [0, 0, "math.sin(query.life_time*122.5)*1.2"]
				},
				"Left Leg": {
					"rotation": [0, 0, "math.sin(query.life_time*122.5)*1.2"]
				}
			}
		}
	}
};
export const animMoveJson = {
	"format_version": "1.8.0",
	"animations": {
		"animation.actor.move": {
			"loop": true,
			"animation_length": 0.6667,
			"anim_time_update": "q.anim_time+math.pow(1.18,q.is_sprinting)*q.delta_time",
			"bones": {
				"Waist": {
					"rotation": [5, 0, "-math.cos(query.anim_time*540)*2"]
				},
				"Body": {
					"rotation": [0, "-math.sin(query.anim_time*540)*24", 0],
					"position": {
						"0.0": [0, -3.64, 0],
						"0.0417": [0, -3.04, 0],
						"0.0833": [0, -0.58, 0],
						"0.125": [0, 0.86, 0],
						"0.1667": [0, 1.28, 0],
						"0.2083": [0, 0.86, 0],
						"0.25": [0, -0.58, 0],
						"0.2917": [0, -3.1, 0],
						"0.3333": [0, -3.64, 0],
						"0.375": [0, -3.04, 0],
						"0.4167": [0, -0.58, 0],
						"0.4583": [0, 0.86, 0],
						"0.5": [0, 1.28, 0],
						"0.5417": [0, 0.86, 0],
						"0.5833": [0, -0.58, 0],
						"0.625": [0, -3.1, 0],
						"0.6667": [0, -3.64, 0]
					}
				},
				"root": {
					"position": [0, 0, 0.75]
				},
				"Head": {
					"rotation": ["math.sin(query.anim_time*1080-12)*8", "-math.sin(query.anim_time*540-45)*6", "-math.sin(query.anim_time*540)*4"],
					"position": {
						"0.0": [0, -4, 0],
						"0.1667": [0, 1, 0],
						"0.3333": [0, -4, 0],
						"0.5": [0, 1, 0],
						"0.6667": [0, -4, 0]
					}
				},
				"cape": {
					"rotation": ["math.sin(query.anim_time*1080)*5", "math.sin(query.anim_time*540+10)*24", 0]
				},
				"Right Arm": {
					"rotation": ["math.sin(query.anim_time*540+10)*-60", "math.sin(query.anim_time*540)*18", 0],
					"position": [0, "-math.cos(query.anim_time*1080)*0.5", 0]
				},
				"Left Arm": {
					"rotation": ["math.sin(query.anim_time*540+10)*60", "math.sin(query.anim_time*540)*18", 0],
					"position": [0, "-math.cos(query.anim_time*1080)*0.5", 0]
				},
				"Right Leg": {
					"rotation": {
						"0.0": [-9.603, 0, 0],
						"0.1667": [70.2, 0, 0],
						"0.2083": [76.5, 0, 0],
						"0.25": [66.6, 0, 0],
						"0.5": [-56, 0, 0],
						"0.5417": [-60.75, 0, 0],
						"0.5833": [-49.5, 0, 0],
						"0.6667": [-9.603, 0, 0]
					},
					"position": {
						"0.0": [0, -0.15, -0.5],
						"0.0417": [0, -0.3, -0.13],
						"0.0833": [0, -1, 0.4],
						"0.125": [0, -2, 0.9],
						"0.1667": [0, -1.8, 1.3],
						"0.25": [0, -0.5, 1.2],
						"0.3333": [0, 1.8, -0.5],
						"0.4167": [0, 2.5, -1.15],
						"0.4583": [0, 2.25, -1.2],
						"0.5833": [0, -2, -0.85],
						"0.625": [0, -0.7, -0.7],
						"0.6667": [0, -0.15, -0.5]
					}
				},
				"Left Leg": {
					"rotation": {
						"0.0": [25.73, 0, 0],
						"0.1667": [-56, 0, 0],
						"0.2083": [-60.75, 0, 0],
						"0.25": [-49.5, 0, 0],
						"0.5": [70.2, 0, 0],
						"0.5417": [76.5, 0, 0],
						"0.5833": [66.6, 0, 0],
						"0.6667": [25.73, 0, 0]
					},
					"position": {
						"0.0": [0, 1.8, -0.5],
						"0.0833": [0, 2.5, -1.15],
						"0.125": [0, 2.25, -1.2],
						"0.25": [0, -2, -0.85],
						"0.2917": [0, -0.7, -0.7],
						"0.3333": [0, -0.15, -0.5],
						"0.375": [0, -0.3, -0.13],
						"0.4167": [0, -1, 0.4],
						"0.4583": [0, -2, 0.9],
						"0.5": [0, -1.8, 1.3],
						"0.5833": [0, -0.5, 1.2],
						"0.6667": [0, 1.8, -0.5]
					}
				}
			},
			"particle_effects": {
				"0.25": {
					"effect": "dust_left"
				},
				"0.5833": {
					"effect": "dust_right"
				}
			}
		}
	}
};
