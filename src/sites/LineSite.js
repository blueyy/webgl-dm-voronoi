/**
 * @author Raoul Harel
 * @license The MIT license (LICENSE.txt)
 * @copyright 2015 Raoul Harel
 * @url https://github.com/rharel/webgl-dm-voronoi
 */

function LineSite(a, b, radius, geometry, material) {

  Site.call(this, SiteType.line, material.color);

  this._a = new THREE.Vector3(a.x, a.y, 0);
  this._b = new THREE.Vector3(b.x, b.y, 0);

  this._aProxy = LineSite._endpointProxy(this, '_a');
  this._bProxy = LineSite._endpointProxy(this, '_b');

  this._geometry = geometry;

  this._material = material;

  this._mesh = {
    endpointA: new THREE.Mesh(
      this._geometry.endpoint,
      this._material
    ),

    endpointB: new THREE.Mesh(
      this._geometry.endpoint,
      this._material
    ),

    edge: new THREE.Mesh(
      this._geometry.edge,
      this._material
    )
  };

  this._mesh.endpointA.scale.set(radius, radius, radius);
  this._mesh.endpointA.rotation.z = Math.PI;

  this._mesh.endpointB.scale.set(radius, radius, radius);

  this._mesh.edge.scale.set(radius, 1, radius);

  this._origin = new THREE.Object3D();
  this._origin.add(
    this._mesh.endpointA,
    this._mesh.endpointB,
    this._mesh.edge
  );

  this._updateMesh();
}

/**
 * Creates a proxy that links endpoint updates to mesh transform updates.
 *
 * @details
 *  We use this proxy to enable users to update line endpoint positions
 *  with the comfortable 'line.a.x = value' syntax and have the changes
 *  automatically trigger and mesh transform update.
 *
 *  Since there are two endpoints, a and b, we use one proxy creator to reduce
 *  code duplication.
 */
LineSite._endpointProxy = function(self, property) {

  return {

    set: function(x, y) {

      self[property].x = +x;
      self[property].y = +y;
      self._updateMesh();
    },

    get x() { return self[property].x; },
    set x(value) {

      self[property].x = +value;
      self._updateMesh();
    },

    get y() { return self[property].y; },
    set y(value) {

      self[property].y = +value;
      self._updateMesh();
    }
  };
};

LineSite.edgeDistanceGeometry = function() {

  return GeometryExtensions.tent(2, 1, 1);
};

LineSite.endpointDistanceGeometry = function(nRadialSegments) {

  return GeometryExtensions.triangleFan(
    1, 1, Math.PI, nRadialSegments
  );
};

LineSite.prototype = Object.create(Site.prototype, {

  _updateMesh: {
    value: function() {

      var ab = new THREE.Vector3().subVectors(this._b, this._a);
      var length = ab.length();

      this._mesh.endpointB.position.y = length;

      this._mesh.edge.scale.y = length;
      this._mesh.edge.position.y = length / 2;

      // merged together //

      var abN = new THREE.Vector3(ab.x, ab.y, 0);
      abN.normalize();

      var q = new THREE.Quaternion();
      q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), abN);

      this._origin.rotation.setFromQuaternion(q);
      this._origin.position.set(this._a.x, this._a.y, 0);
    }
  },

  a: {
    get: function a() {
      return this._aProxy;
    }
  },

  b: {
    get: function b() {
      return this._bProxy;
    }
  },

  mesh: {
    get: function mesh() {
      return this._mesh;
    }
  },

  origin: {
    get: function origin() {
      return this._origin;
    }
  }
});

LineSite.prototype.constructor = LineSite;