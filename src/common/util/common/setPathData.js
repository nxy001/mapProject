import { 
  Cartesian3,
  Cartographic,
  Ellipsoid,
  HermiteSpline,
} from "cesium";
export default{
  /**
   * @name: 返回两点之间的曲线坐标点
   * @params {startPoint 起点位置}
   *         {endPoint，终点位置}
   *         {num, 精度数，数字越大越精细，运动轨迹更流畅}
   * @return:
   */
  getPoints (startPoint, endPoint, num = 500) {
    const newStartPoint = Cartesian3.fromDegrees(
      +startPoint[0],
      +startPoint[1],
      0
    );
    const newEndPoint = Cartesian3.fromDegrees(
      +endPoint[0],
      +endPoint[1],
      0
    );


    const addPointCartesian = new Cartesian3();
    Cartesian3.add(newStartPoint, newEndPoint, addPointCartesian);
    const midPointCartesian = new Cartesian3();
    Cartesian3.divideByScalar(addPointCartesian, 2, midPointCartesian);
    const midPointCartographic = Cartographic.fromCartesian(midPointCartesian);
    // 除以的这个数越小 开始的位置聚集的位置就越陡，越大 开始的位置线就越平缓，
    midPointCartographic.height = Cartesian3.distance(newStartPoint, newEndPoint) / 8;
    const midPoint = new Cartesian3();
    Ellipsoid.WGS84.cartographicToCartesian(midPointCartographic, midPoint);
    const spline = HermiteSpline.createC1({
      times: [0.0, 0.5, 1],
      points: [newStartPoint, midPoint, newEndPoint]
    });
    const curvePointsArr = [];
    for (let i = 0, len = num; i < len; i++) {
      curvePointsArr.push(spline.evaluate(i / len));
    }
    return curvePointsArr;
  },


  // 贝塞尔曲线二维转三维  返回一个三维点数组
  getBSRPoints (start,end,h,mount=100) {
    const [x1,y1] = start
    const [x2,y2] = end
    let point1 = [y1, 0]
    let point2 = [(y2+y1)/2, h]
    let point3 = [y2, 0]
    let arr = this.getBSR(point1, point2, point3,mount)
    let arr3d = []
    for (let i in arr) {
      let x = (x2-x1)*(arr[i][0]-y1)/(y2-y1) + x1
      arr3d.push([x, arr[i][0], arr[i][1]])
    }
    return arr3d
  },
  // 生成贝塞尔曲线
  getBSR (point1, point2, point3,mount) {
    var ps = [{ x: point1[0], y: point1[1] }, { x: point2[0], y: point2[1] }, { x: point3[0], y: point3[1] }]
    let guijipoints = this.createBezierPoints(ps, mount||100);
    return guijipoints
  },
  // 贝赛尔曲线算法
  // 参数：
  // anchorpoints: [{ x: 116.30, y: 39.60 }, { x: 37.50, y: 40.25 }, { x: 39.51, y: 36.25 }]
  createBezierPoints (anchorpoints, pointsAmount) {
    var points = [];
    for (var i = 0; i < pointsAmount; i++) {
      var point = this.multiPointBezier(anchorpoints, i / pointsAmount)
      points.push([point.x, point.y]);
    }
    return points;
  },
  multiPointBezier(points, t) {
    var len = points.length;
    var x = 0, y = 0;
    var erxiangshi = function (start, end) {
      var cs = 1, bcs = 1;
      while (end > 0) {
        cs *= start;
        bcs *= end;
        start--;
        end--;
      }
      return (cs / bcs);
    };
    for (var i = 0; i < len; i++) {
      var point = points[i];
      x += point.x * Math.pow((1 - t), (len - 1 - i)) * Math.pow(t, i) * (erxiangshi(len - 1, i));
      y += point.y * Math.pow((1 - t), (len - 1 - i)) * Math.pow(t, i) * (erxiangshi(len - 1, i));
    }
    return { x: x, y: y };
  }
}
  