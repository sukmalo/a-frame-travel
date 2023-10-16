!function(e){"function"==typeof define&&define.amd?define(e):e()}((function(){"use strict";AFRAME.registerSystem("mirror",{schema:{},mirrors:[],init:function(){this.sceneEl.renderer.autoClear=!1,this.sceneEl.renderer.info.autoReset=!1;const e=function(){},t=new THREE.Mesh;t.frustumCulled=!1,t.material.transparent=!0,t.renderOrder=Number.MAX_VALUE,this.sentinel=t,this.sceneEl.object3D.add(this.sentinel),t.onAfterRender=(r,i,s)=>{if(r.xr.isPresenting){const e=r.xr.getCamera().cameras;if(s!=e[e.length-1])return}t.visible=!1,this.mirrors.forEach((e=>e.setInactive()));const a=i.onAfterRender;i.onAfterRender=e,this.mirrors.forEach((e=>e.render(r,i,s))),this.mirrors.forEach((e=>e.setActive())),t.visible=!0,i.onAfterRender=a}},tick:function(){const e=this.sceneEl.object3D;e.children[e.children.length-1]!==this.sentinel&&e.add(this.sentinel),this.sceneEl.renderer.info.reset()},registerMirror:function(e){this.mirrors.push(e),e.setMirrorId(this.mirrors.length)},unregisterMirror:function(e){const t=this.mirrors.indexOf(e);-1!==t&&(this.mirrors.splice(t,1),this.mirrors.forEach(((e,t)=>e.setMirrorId(t+1))))}}),AFRAME.registerComponent("mirror",{schema:{layers:{type:"array",default:[0]}},init:function(){this.mirrorMaterial=this.el.getObject3D("mesh").material;const e=this.mirrorMaterial;e.transparent=!0,e.colorWrite=!1,e.depthWrite=!0,e.stencilWrite=!0,e.depthFunc=THREE.LessEqualDepth,e.stencilFunc=THREE.AlwaysStencilFunc,e.stencilZPass=THREE.ReplaceStencilOp,e.stencilZFail=THREE.KeepStencilOp,this.system.registerMirror(this),e.stencilRef=this.mirrorId,this.layers=new THREE.Layers,this.layers.disableAll(),this.tempCamera=new THREE.PerspectiveCamera,this.tempCameras=[new THREE.PerspectiveCamera,new THREE.PerspectiveCamera],this.clippingPlane=new THREE.Plane;const t=new THREE.Vector4,r=new THREE.Plane,i=new THREE.Vector4;this.adjustProjectionMatrix=function(e){r.copy(this.clippingPlane).applyMatrix4(e.matrixWorldInverse);const s=t.set(r.normal.x,r.normal.y,r.normal.z,r.constant),a=e.projectionMatrix;i.x=(Math.sign(s.x)+a.elements[8])/a.elements[0],i.y=(Math.sign(s.y)+a.elements[9])/a.elements[5],i.z=-1,i.w=(1+a.elements[10])/a.elements[14],s.multiplyScalar(2/s.dot(i)),a.elements[2]=s.x,a.elements[6]=s.y,a.elements[10]=s.z+1-0,a.elements[14]=s.w},this.copyCamera=function(e,t){t.matrixWorld.copy(e.matrixWorld),t.matrixWorldInverse.copy(e.matrixWorldInverse),t.projectionMatrix.copy(e.projectionMatrix),t.layers.mask=e.layers.mask};const s=this.el.sceneEl.renderer.state.setMaterial,a=function(e,t){s(e,!t)};this.unpatchWebGLState=function(e){e.setMaterial=s},this.patchWebGLState=function(e){e.setMaterial=a},this._mirrorPos=new THREE.Vector3,this._mirrorQuat=new THREE.Quaternion,this._cameraPos=new THREE.Vector3,this._cameraLPos=new THREE.Vector3,this._cameraRPos=new THREE.Vector3,this._normal=new THREE.Vector3,this._reflectionMatrix=new THREE.Matrix4},setMirrorId:function(e){this.mirrorId=e,this.mirrorMaterial.stencilRef=e},setInactive:function(){this.mirrorMaterial.stencilWrite=!1},setActive:function(){this.mirrorMaterial.stencilWrite=!0},update:function(){this.layers.disableAll(),this.data.layers.map((e=>this.layers.enable(+e)))},render:function(e,t,r){const i=e.xr.isPresenting?e.xr.getCamera():this.tempCamera,s=this.el.object3D.getWorldPosition(this._mirrorPos),a=this._normal.set(0,0,1);a.applyQuaternion(this.el.object3D.getWorldQuaternion(this._mirrorQuat));const n=-s.dot(a);let o;if(this.clippingPlane.set(a,n),e.xr.isPresenting){const e=i.cameras;this._cameraLPos.setFromMatrixPosition(e[0].matrixWorld),this._cameraRPos.setFromMatrixPosition(e[1].matrixWorld),o=this._cameraLPos.subVectors(s,this._cameraLPos).dot(a)<=0||this._cameraRPos.subVectors(s,this._cameraRPos).dot(a)<=0}else{o=r.getWorldPosition(this._cameraPos).subVectors(s,this._cameraPos).dot(a)<=0}if(!o)return;const c=this._reflectionMatrix.set(1-2*a.x*a.x,-2*a.x*a.y,-2*a.x*a.z,-2*a.x*n,-2*a.x*a.y,1-2*a.y*a.y,-2*a.y*a.z,-2*a.y*n,-2*a.x*a.z,-2*a.y*a.z,1-2*a.z*a.z,-2*a.z*n,0,0,0,1);if(e.xr.isPresenting){const e=i.cameras;this.copyCamera(i,this.tempCamera);for(lett=0;t<e.length;t++)this.copyCamera(e[t],this.tempCameras[t]),e[t].matrixWorld.premultiply(c),e[t].matrixWorldInverse.copy(e[t].matrixWorld).invert(),e[t].layers.mask=this.layers.mask;this.setProjectionFromUnion(i,e[0],e[1]),this.adjustProjectionMatrix(e[0]),this.adjustProjectionMatrix(e[1])}else i.near=r.near,i.far=r.far,i.projectionMatrix.copy(r.projectionMatrix),i.matrix.copy(r.matrixWorld).premultiply(c),i.matrix.decompose(i.position,i.quaternion,i.scale),i.matrixWorld.copy(i.matrix),i.matrixWorldInverse.copy(i.matrix).invert(),this.adjustProjectionMatrix(i);const l=this.el.getObject3D("mesh");l.visible=!1,e.xr.cameraAutoUpdate=!1,this.patchWebGLState(e.state),e.state.buffers.stencil.setTest(!0),e.state.buffers.stencil.setFunc(THREE.EqualStencilFunc,this.mirrorId,255),e.state.buffers.stencil.setOp(THREE.KeepStencilOp,THREE.KeepStencilOp,THREE.KeepStencilOp),e.state.buffers.stencil.setLocked(!0),e.clearDepth();const m=i.layers.mask;i.layers.mask=this.layers.mask;const h=t.matrixWorldAutoUpdate;if(t.matrixWorldAutoUpdate=!1,e.render(t,this.tempCamera),t.matrixWorldAutoUpdate=h,i.layers.mask=m,e.state.buffers.stencil.setLocked(!1),this.unpatchWebGLState(e.state),e.xr.cameraAutoUpdate=!0,l.visible=!0,e.xr.isPresenting){const e=i.cameras;this.copyCamera(this.tempCamera,i);for(let t=0;t<e.length;t++)this.copyCamera(this.tempCameras[t],e[t])}},setProjectionFromUnion:function(e,t,r){this._cameraLPos.setFromMatrixPosition(t.matrixWorld),this._cameraRPos.setFromMatrixPosition(r.matrixWorld);const i=this._cameraLPos.distanceTo(this._cameraRPos),s=t.projectionMatrix.elements,a=r.projectionMatrix.elements,n=s[14]/(s[10]-1),o=s[14]/(s[10]+1),c=(s[9]+1)/s[5],l=(s[9]-1)/s[5],m=(s[8]-1)/s[0],h=(a[8]+1)/a[0],p=n*m,d=n*h,u=i/(-m+h),x=u*-m;t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(x),e.translateZ(u),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert();const E=n+u,f=o+u,y=p-x,P=d+(i-x),M=c*o/f*E,R=l*o/f*E;e.projectionMatrix.makePerspective(y,P,M,R,E,f)}}),AFRAME.registerPrimitive("a-mirror",{defaultComponents:{geometry:{primitive:"plane"},mirror:{}},mappings:{layers:"mirror.layers"}})}));