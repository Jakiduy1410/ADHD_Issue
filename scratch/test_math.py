def calc_trail(totalIslands, curIdx=0, isAllCompleted=False):
    points = []
    for r in range(totalIslands, 0, -1):
        xr = 170 if totalIslands == 1 else (230 if r % 2 == 1 else 110)
        yr = 45 + r * 105
        points.append({"x": xr, "y": yr, "r": r, "islandIndex": totalIslands - r})
    points.append({"x": 170, "y": 45, "r": 0, "isTreasure": True})
    
    full_path = f"M {points[0]['x']} {points[0]['y']}"
    for k in range(len(points) - 1):
        p1 = points[k]
        p2 = points[k+1]
        midY = (p1["y"] + p2["y"]) / 2
        full_path += f" C {p1['x']} {midY}, {p2['x']} {midY}, {p2['x']} {p2['y']}"
    
    return full_path, 45 + totalIslands * 105 + 55

for n in [1, 2, 3, 4, 5]:
    path, h = calc_trail(n)
    print(f"N={n}, Height={h}: {path}")
