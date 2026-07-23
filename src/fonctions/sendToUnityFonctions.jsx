export function presenterNewOeuvre(oeuvre) {}

export function enAttenteDePresentation(oeuvre) {
  // UnityWebGL utilise SendMessage(gameObject, methodName, parameter)

  const payload = JSON.stringify(oeuvre);
  console.log(oeuvre.image); // transformer l'objet en string
  if (window.unityInstance) {
    // unityInstance est créé par WebGL
    window.unityInstance.SendMessage(
      "BienController", // nom du GameObject dans Unity
      "saveOeuvreTemp", // méthode C# à appeler
      payload // string JSON
    );
  }
  //Modifier le contexte pour que l'oeuvre soit exposé
  if (window.unityInstance) {
    // unityInstance est créé par WebGL
    window.unityInstance.SendMessage(
      "Action", // nom du GameObject dans Unity
      "setAction", // méthode C# à appeler
      "ajouterOeuvreDansMur" // string JSON
    );
  }
}

export function UpdateOeuvreToUnity(oeuvre) {
  // UnityWebGL utilise SendMessage(gameObject, methodName, parameter)
  const payload = JSON.stringify(oeuvre);
  console.log(oeuvre.image); // transformer l'objet en string
  if (window.unityInstance) {
    // unityInstance est créé par WebGL
    window.unityInstance.SendMessage(
      "BienController", // nom du GameObject dans Unity
      "updateOeuvre", // méthode C# à appeler
      payload // string JSON
    );
  }
}

export function suppressionReussie() {
  // const payload = JSON.stringify({ oeuvre_id: id });
 const payload = "";

  if (window.unityInstance) {
    // unityInstance est créé par WebGL
    window.unityInstance.SendMessage(
      "BienController", // nom du GameObject dans Unity
      "suppressionReussie", // méthode C# à appeler
      payload // string JSON
    );
  }
}

export function suppressionEchoue() {
  // const payload = JSON.stringify({ oeuvre_id: id });
  console.log("id react ");
  if (window.unityInstance) {
    // unityInstance est créé par WebGL
    window.unityInstance.SendMessage(
      "BienController", // nom du GameObject dans Unity
      "suppressionEchouee", // méthode C# à appeler
      payload // string JSON
    );
  }
}

//Enregistrer la presentation coté Unity
export function permutationReussie(data) {
  if (window.unityInstance) {
    // unityInstance est créé par WebGL
    window.unityInstance.SendMessage(
      "BienController", // nom du GameObject dans Unity
      "permutationReussie", // méthode C# à appeler
      data // string JSON
    );
  }
}
//Enregistrer la presentation coté Unity
export function presentationReussi(data) {
  if (window.unityInstance) {
    // unityInstance est créé par WebGL
    window.unityInstance.SendMessage(
      "BienController", // nom du GameObject dans Unity
      "presentationReussi", // méthode C# à appeler
      data // string JSON
    );
  }
}
