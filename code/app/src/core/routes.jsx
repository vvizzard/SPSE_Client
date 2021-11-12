import React from "react";
import { Switch, Route } from "react-router";
import ROUTES from "Constants/routes";
import loadable from "@loadable/component";

// Load bundles asynchronously so that the initial render happens faster
const Login = loadable(() =>
  import(/* webpackChunkName: "WelcomeChunk" */ "Pages/login/login")
);
const Register = loadable(() =>
  import(/* webpackChunkName: "WelcomeChunk" */ "Pages/register/register")
);
const Home = loadable(() =>
  import(/* webpackChunkName: "WelcomeChunk" */ "Pages/home/home")
);
const Users = loadable(() =>
  import(/* webpackChunkName: "WelcomeChunk" */ "Pages/users/users")
);
const Question = loadable(() =>
  import(/* webpackChunkName: "WelcomeChunk" */ "Pages/question/question")
);
const Thematique = loadable(() =>
  import(/* webpackChunkName: "WelcomeChunk" */ "Pages/thematique/thematique")
);
const Indicateur = loadable(() =>
  import(/* webpackChunkName: "WelcomeChunk" */ "Pages/indicateur/indicateur")
);
const Questions = loadable(() =>
  import(/* webpackChunkName: "WelcomeChunk" */ "Pages/question/questions")
);
const Data = loadable(() =>
  import(/* webpackChunkName: "WelcomeChunk" */ "Pages/data/data")
);
const Detail = loadable(() =>
  import(/* webpackChunkName: "WelcomeChunk" */ "Pages/data/detail")
);
const Welcome = loadable(() =>
  import(/* webpackChunkName: "WelcomeChunk" */ "Pages/welcome/welcome")
);
const About = loadable(() =>
  import(/* webpackChunkName: "AboutChunk" */ "Pages/about/about")
);
const Motd = loadable(() =>
  import(/* webpackChunkName: "MotdChunk" */ "Pages/motd/motd")
);
const Localization = loadable(() =>
  import(
    /* webpackChunkName: "LocalizationChunk" */ "Pages/localization/localization"
  )
);
const UndoRedo = loadable(() =>
  import(/* webpackChunkName: "UndoRedoChunk" */ "Pages/undoredo/undoredo")
);
const ContextMenu = loadable(() =>
  import(/* webpackChunkName: "ContextMenuChunk" */ "Pages/contextmenu/contextmenu")
);

class Routes extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path={ROUTES.LOGIN} component={Login}></Route>
        <Route path={ROUTES.REGISTER} component={Register}></Route>
        <Route path={ROUTES.HOME} component={Home}></Route>
        <Route path={ROUTES.USERS} component={Users}></Route>
        <Route path={ROUTES.QUESTION} component={Question}></Route>
        <Route path={ROUTES.THEMATIQUE} component={Thematique}></Route>
        <Route path={ROUTES.INDICATEUR} component={Indicateur}></Route>
        <Route path={ROUTES.QUESTIONS} component={Questions}></Route>
        <Route path={ROUTES.DATA} component={Data}></Route>
        <Route path={ROUTES.DATA_DETAIL+"/:id"} component={Detail}></Route>
        <Route path={ROUTES.WELCOME} component={Welcome}></Route>
        <Route path={ROUTES.ABOUT} component={About}></Route>
        <Route path={ROUTES.MOTD} component={Motd}></Route>
        <Route path={ROUTES.LOCALIZATION} component={Localization}></Route>
        <Route path={ROUTES.UNDOREDO} component={UndoRedo}></Route>
        <Route path={ROUTES.CONTEXTMENU} component={ContextMenu}></Route>
      </Switch>
    );
  }
}

export default Routes;
