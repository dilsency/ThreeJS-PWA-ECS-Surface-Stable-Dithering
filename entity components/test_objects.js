// imports
// base
import * as THREE from "three";
// ECS
import {EntityComponent} from "entity_component";
import { createFractalMaterial } from "../shaders/Simple_FractalDithering.js";

//
export class EntityComponentTestCube extends EntityComponent
{
    // bare minimum
    #params = null;

    //
    #cube = null;
    #positionOffset = {x:0,y:0,z:0};

    // construct
    constructor(params)
    {
        super(params);
        this.#params = params;

        //
        if(params.positionOffset != null)
        {
            this.#positionOffset = params.positionOffset;
        }
    }

     // lifecycle

    async methodInitialize()
    {
        console.log("EntityComponentTestCube: methodInitialize");

        try {
            console.log("try started");

            const [vert, frag] = await Promise.all([
                fetch('shaders/Simple_FractalDithering.vert').then(r => r.text()),
                fetch('shaders/Simple_FractalDithering.frag').then(r => r.text())
            ]);

            /*
            const uniforms = {
                uMainTex:
                {
                    value:
                        new THREE.TextureLoader().load("textures/texture.png")
                },
            };
            */

            const geometry = new THREE.BoxGeometry( 1, 1, 1 );

            const loader = new THREE.TextureLoader();
            const texture = await new Promise((res, rej) => loader.load('textures/texture_checkerboard.png', res, undefined, rej));

            let material;
            try {
                console.log("try to create shader material : ");
                material = await createFractalMaterial({ map: texture, level: 3, shape: 9, });
                //material = createFractalMaterial({ map: uniforms.uMainTex.value });
                console.log(material);

                /*
                material = new THREE.RawShaderMaterial({
                    vertexShader: vert,
                    fragmentShader: frag,
                    uniforms,
                    glslVersion: THREE.GLSL3
                });
                */

                console.log("successful shader?");
            } catch (e) {
                console.error('Shader creation failed, falling back to basic material.', e);
                material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
            }

            this.#cube = new THREE.Mesh(geometry, material);
            this.#params.scene.add(this.#cube);

            this.#cube.position.x += this.#positionOffset.x;
            this.#cube.position.y += this.#positionOffset.y;
            this.#cube.position.z += this.#positionOffset.z;

            this.methodRegisterInvokableHandler('update.position', (paramMessage) =>{ this.methodHandleUpdatePosition(paramMessage);});
        } catch (err) {
            console.error('Failed to load shaders, using fallback material.', err);
            const geometry = new THREE.BoxGeometry( 1, 1, 1 );
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
            this.#cube = new THREE.Mesh(geometry, material);
            this.#params.scene.add(this.#cube);

            this.#cube.position.x += this.#positionOffset.x;
            this.#cube.position.y += this.#positionOffset.y;
            this.#cube.position.z += this.#positionOffset.z;

            this.methodRegisterInvokableHandler('update.position', (paramMessage) =>{ this.methodHandleUpdatePosition(paramMessage);});
        }
    }

    methodUpdate(timeElapsed, timeDelta)
    {
        //this.#cube.rotation.y += timeDelta;
    }

    // handlers

    methodHandleUpdatePosition(paramMessage)
    {
        this.#cube.position.copy(paramMessage.invokableHandlerValue);
    }
}

//
export class EntityComponentButtonPointerLock extends EntityComponent
{
    // bare minimum
    #params = null;

    //
    #elementButton = null;
    #isVisibleButton = true;

    // construct
    constructor(params)
    {
        super(params);
        this.#params = params;
    }

     // lifecycle

    methodInitialize()
    {
        //
        this.#params.document.addEventListener("pointerlockchange", this.methodOnPointerLockChange.bind(this), false);
        this.#params.document.addEventListener("pointerlockerror", this.methodOnPointerLockError.bind(this), false);

        //
        this.#elementButton = this.#params.document.createElement("button");
        this.#elementButton.innerText = "PointerLock";
        this.#elementButton.style.position = "fixed";
        this.#elementButton.style.bottom = "0";
        this.#elementButton.style.left = "calc(50% - 45px)";
        this.#elementButton.style.right = "calc(50% - 45px)";
        this.#elementButton.style.width = "90px";
        this.#elementButton.style.fontSize = "11px";
        this.#elementButton.addEventListener("click", ((e) => this.methodOnClickButton(e)));
        this.#params.document.body.appendChild(this.#elementButton);
    }

    methodUpdate(timeElapsed, timeDelta)
    {
    }

    //

    async methodOnClickButton(e)
    {
        await this.#params.renderer.domElement.requestPointerLock();
    }

    methodOnPointerLockChange(e)
    {
        //
        const res = this.methodGetIsPointerLocked();
        if(!res)
        {
            this.#isVisibleButton = true;
            this.#elementButton.style.display = "block";
        }
        else {
            this.#isVisibleButton = false;
            this.#elementButton.style.display = "none";
        }
    }
    methodOnPointerLockError(e)
    {
        
    }

    methodGetIsPointerLocked()
    {
        const res = (this.#params.document.pointerLockElement == null || this.#params.document.pointerLockElement == undefined || this.#params.document.pointerLockElement !== this.#params.renderer.domElement);

        return !res;
    }
}
