const { dialog, app } = require("electron");
const path = require("path");
const fs = require("fs");
let xlsx = require("json-as-xlsx");
const readXlsxFile = require("read-excel-file/node");
const log = require("electron-log");
const BaseDao = require("./database/BaseDao");
const BaseRepository = require("./database/BaseRepository");
const ReponseRepository = require("./database/ReponseRepository");
const fetch = require("node-fetch");
const FormData = require("form-data");

class Exportation {
  /**
   * @name validerUser
   * @description Change the status of a user
   * @param {Array} ids
   * @param {int} status
   *
   * @returns
   */
  async validerUser(ids, status) {
    let valiny = [];
    // for (let index = 0; index < ids.length; index++) {
    try {
      const body = { ids: ids, value: status };
      log.info("validerUser : body");
      log.info(JSON.stringify(body));
      log.info("------------------------------------");
      const response = await fetch(
        "https://spse.llanddev.org/valider_user.php",
        {
          method: "post",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      log.info("ValiderUser : ");
      // log.info(JSON.stringify({ id: id, status: status }));
      log.info(data);
      log.info("---------------");
      valiny.push(data);
    } catch (err) {
      log.info(err);
    }
    // }
    log.info("validerUser: farany");
    log.info(valiny);
    log.info("-------------------------------------");
    return valiny;
  }

  async synchroniserOld(repository) {
    try {
      const response = await fetch(
        "https://spse.llanddev.org/synchroniser.php",
        {
          method: "post",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (data.user) {
        repository.table = "user";
        const temp = await repository.clean(data.user);
      }
      if (data.reponse) {
        repository.table = "reponse";
        const temp = await repository.clean(data.reponse);
      }
      if (data.reponse_non_valide) {
        repository.table = "reponse_non_valide";
        const temp = await repository.clean(data.reponse_non_valide);
      }
      return true;
    } catch (err) {
      log.info(err);
      return false;
    }
  }

  async synchroniser(repository) {
    try {
      const response = await fetch(
        "https://spse.llanddev.org/synchronise.php",
        {
          method: "get",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (data.user) {
        repository.table = "user";
        const temp = await repository.cleanAll(data.user);
      }
      if (data.reponse) {
        repository.table = "reponse";
        try {
          const temp = await repository.cleanAll(data.reponse);
        } catch (error) {
          log.info("cleanAll reponse : ");
          log.info(error);
          log.info("--------------------------");
        }
      }
      if (data.reponse_non_valide) {
        repository.table = "reponse_non_valide";
        try {
          const temp = await repository.cleanAll(data.reponse_non_valide);
        } catch (error) {
          log.info("cleanAll reponse : ");
          log.info(error);
          log.info("--------------------------");
        }
      }
      return true;
    } catch (err) {
      log.info(err);
      return false;
    }
  }

  async validation(page, districtId) {
    try {
      const response = await fetch(
        "https://spse.llanddev.org/" + page + ".php",
        {
          method: "post",
          body: JSON.stringify({ district_id: districtId }),
          headers: { "Content-Type": "application/json" },
        }
      );
      log.info("validation service stringify district_id");
      log.info(JSON.stringify({ district_id: districtId }));
      const data = await response.json();
      return data;
    } catch (err) {
      log.info(err);
      return false;
    }
  }

  async validationSynch(districtId, repository) {
    try {
      const data = await repository.dao.all(
        `SELECT * FROM reponse_non_valide 
      WHERE user_id in (
          SELECT id FROM user WHERE district_id = ?
      )`,
        districtId
      );

      const body = { data };

      const response = await fetch("https://spse.llanddev.org/validate.php", {
        method: "POST",
        // mode: 'cors',
        body: JSON.stringify({ body }),
        headers: { "Content-Type": "application/json" },
      });

      log.info("reponse part 1");
      log.info(JSON.stringify({ body }));
      log.info(response);
      log.info("reponse part 2");
      const reponse = await response.json();

      log.info("groupe de reponse part 1");
      log.info(response);
      log.info(reponse);
      log.info("groupe de reponse part 2");

      return reponse;
    } catch (err) {
      log.info(err);
      return false;
    }
  }

  /**
   * @name uploadGeojson
   * @description Upload a file (geojson) to the server.
   * @param {String} name Name of the file to put in the server
   * without extensions
   * @param {*} data The file as readStream
   *
   * @returns
   */
  async uploadGeojson(name, data) {
    try {
      // const data = `{
      //   "type": "FeatureCollection",
      //   "name": "Analanjirofo",
      //   "features": [
      //     { "type": "Feature", "properties": { "NOM_REGION": "ANALANJIROFO", "NOM_DISTRI": "FENOARIVO ATSINANANA", "NOM_COMMUN": "Ambanjan'ny Sahalava", "C_REG": 32, "C_COM": 305500, "C_DST": 305 }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 49.441507758114255, -17.097179407670168 ], [ 49.440862301121278, -17.097942772151047 ], [ 49.438905407652612, -17.098143322371737 ], [ 49.436926161228754, -17.098633317219779 ], [ 49.434982489933596, -17.099328302194159 ], [ 49.434837222174522, -17.099461868441693 ], [ 49.433520035320406, -17.100672940277153 ], [ 49.432835181941357, -17.100955073607413 ], [ 49.431552082306318, -17.102754861071244 ], [ 49.430273682717356, -17.104851388946418 ], [ 49.429382166570178, -17.107016422961699 ], [ 49.428785059081818, -17.108286675817535 ], [ 49.428309752263388, -17.11019865407917 ], [ 49.430263263882878, -17.110662295695985 ], [ 49.432310509561482, -17.110781741102869 ], [ 49.433884669489728, -17.111949578627748 ], [ 49.434148558170158, -17.114287403157359 ], [ 49.436041832862124, -17.113846146272184 ], [ 49.438059607997538, -17.11351766673701 ], [ 49.439530298935239, -17.112279564545915 ], [ 49.440909018404085, -17.111908014411981 ], [ 49.441394605268087, -17.11186485918337 ], [ 49.443133301107991, -17.11171032575891 ], [ 49.442833259169902, -17.114395333242584 ], [ 49.441956758468628, -17.116214164913316 ], [ 49.441932771590551, -17.118164415464044 ], [ 49.44215838828481, -17.118582788429393 ], [ 49.442837202158529, -17.119893637476771 ], [ 49.442736351074203, -17.120779933819225 ], [ 49.44244553248123, -17.121841215956547 ], [ 49.441762457431878, -17.123119693198685 ], [ 49.440122391336395, -17.12504649722062 ], [ 49.439080183239454, -17.125865198256282 ], [ 49.438268567728919, -17.127356960998526 ], [ 49.437051171618009, -17.128220520398056 ], [ 49.436185451548596, -17.129078883881363 ], [ 49.43613333936257, -17.129946380836927 ], [ 49.43667841540524, -17.131037601293784 ], [ 49.436700009207527, -17.132390222036474 ], [ 49.436517317152777, -17.134718282194051 ], [ 49.437328885695443, -17.135974681641365 ], [ 49.437827325699274, -17.136897465958146 ], [ 49.437537142576559, -17.138001012342798 ], [ 49.436983178044876, -17.139108452145905 ], [ 49.437263835290551, -17.140161289710203 ], [ 49.437177221493954, -17.141621202880636 ], [ 49.436755138995075, -17.142726695498869 ], [ 49.436690841905232, -17.144207417542006 ], [ 49.436490601110187, -17.145436470688818 ], [ 49.43584935979073, -17.146587476740599 ], [ 49.435111406823026, -17.147190278929973 ], [ 49.434796994664374, -17.147600957724219 ], [ 49.434375597158528, -17.147222470525026 ], [ 49.433543404482215, -17.147410982145303 ], [ 49.432719628695146, -17.148384797968035 ], [ 49.431875936504802, -17.149657070061142 ], [ 49.431065546579653, -17.149850818897715 ], [ 49.43034202144981, -17.149377502271136 ], [ 49.429996485404246, -17.148555910066108 ], [ 49.429986178067807, -17.147798831306702 ], [ 49.429640286422391, -17.146954609291186 ], [ 49.428756797652326, -17.147057429849969 ], [ 49.42787315534202, -17.147113885756518 ], [ 49.427386699834052, -17.146477898184585 ], [ 49.427757811273636, -17.145624301527093 ], [ 49.428348366918726, -17.145089274731458 ], [ 49.428412631911939, -17.144514631377408 ], [ 49.428192082204021, -17.144127626836674 ], [ 49.427939360629033, -17.143121126225594 ], [ 49.427849690443288, -17.141768881585918 ], [ 49.427143060031128, -17.14076796565292 ], [ 49.42621203232909, -17.140871472656329 ], [ 49.425474035834768, -17.141109856660744 ], [ 49.424930537294451, -17.141575276616805 ], [ 49.420324769865019, -17.143870687238973 ], [ 49.418216618570803, -17.144154083431278 ], [ 49.415822260405598, -17.144760084449683 ], [ 49.414241912323199, -17.145179079389848 ], [ 49.412302546427163, -17.145737211691372 ], [ 49.40966821707844, -17.146435920464686 ], [ 49.407393742092111, -17.147086987612212 ], [ 49.405213833961923, -17.147554206199654 ], [ 49.403510925544275, -17.147765458711284 ], [ 49.40224416829674, -17.148184897440338 ], [ 49.401094575288063, -17.148510620853155 ], [ 49.400400462277069, -17.148742623647962 ], [ 49.39951597688615, -17.149342833800347 ], [ 49.398726724533681, -17.149873841626789 ], [ 49.398201684494083, -17.15047272800313 ], [ 49.39770039733407, -17.151163356007583 ], [ 49.397198782520832, -17.15164726771199 ], [ 49.396218822670534, -17.15233976076615 ], [ 49.395405417052174, -17.15275592945801 ], [ 49.394735002670117, -17.152965026361198 ], [ 49.393872750642792, -17.153152090661433 ], [ 49.393103740388149, -17.152695729268114 ], [ 49.392910172875133, -17.152190918787095 ], [ 49.392763883280956, -17.151479794965269 ], [ 49.392641927340414, -17.150859857443599 ], [ 49.392470912536908, -17.150033914083192 ], [ 49.392324629480697, -17.149322879444835 ], [ 49.392322908607227, -17.148840648178194 ], [ 49.392368788945504, -17.148174183815041 ], [ 49.392462762190725, -17.147577022193705 ], [ 49.392460411166866, -17.146980167583457 ], [ 49.392458142271295, -17.146313856261564 ], [ 49.392455791757143, -17.145717001422891 ], [ 49.392382331496599, -17.145304172441051 ], [ 49.392141486779067, -17.144891498127045 ], [ 49.391838634821958, -17.144606769833722 ], [ 49.391389625279622, -17.144328092535943 ], [ 49.390823959775382, -17.14421320205172 ], [ 49.390635803842258, -17.144498321265541 ], [ 49.38956553667856, -17.144901865913617 ], [ 49.388510778855895, -17.144685107923205 ], [ 49.387690204272246, -17.14412159074363 ], [ 49.387447460487294, -17.143848941899861 ], [ 49.387029749162963, -17.142982582447118 ], [ 49.386803959520165, -17.14218224960543 ], [ 49.386616790932244, -17.14062419629084 ], [ 49.386359325332172, -17.13922797757332 ], [ 49.385816527312478, -17.137949529164089 ], [ 49.385303113738068, -17.137083913575683 ], [ 49.384626456639502, -17.136518837274455 ], [ 49.383470861363563, -17.1359365226098 ], [ 49.38191588644456, -17.135840427958222 ], [ 49.381438032781809, -17.135892533892807 ], [ 49.380438348689161, -17.13622555162793 ], [ 49.377939189044184, -17.137082262304521 ], [ 49.377701276199602, -17.13715406783405 ], [ 49.376797056114505, -17.137508777499967 ], [ 49.3752190771146, -17.13748251372742 ], [ 49.374787202967369, -17.137395577562817 ], [ 49.373872644408145, -17.136902265582986 ], [ 49.37299894576153, -17.135903461061098 ], [ 49.372634875307206, -17.135494820949027 ], [ 49.371604731647288, -17.13534652246706 ], [ 49.37021448743188, -17.135042421740255 ], [ 49.36922578866217, -17.134388703484724 ], [ 49.369029805461977, -17.134023902358472 ], [ 49.36793414880907, -17.132500285044994 ], [ 49.367208319821259, -17.131866491323617 ], [ 49.366108357263307, -17.131833712936579 ], [ 49.365253493883174, -17.132302934286496 ], [ 49.364688061203019, -17.132952617670064 ], [ 49.363771455556012, -17.13413361930678 ], [ 49.363653230367042, -17.134272592205395 ], [ 49.363583863762877, -17.134457133700579 ], [ 49.362910071973815, -17.1359565391705 ], [ 49.361946863407056, -17.137276022302721 ], [ 49.36095453661428, -17.138159927576183 ], [ 49.360413262551376, -17.138854979688055 ], [ 49.359785101389662, -17.140193359384124 ], [ 49.35936815408494, -17.141253702850136 ], [ 49.359114246442111, -17.14192198069059 ], [ 49.359022233575651, -17.142198298434025 ], [ 49.358320627038523, -17.143423098211176 ], [ 49.357195952138134, -17.145203514448347 ], [ 49.355842243181364, -17.145931053635241 ], [ 49.355440273049595, -17.146257097520071 ], [ 49.355345973912222, -17.146349905030355 ], [ 49.355185061615266, -17.146879663239091 ], [ 49.355048563597734, -17.147431614449928 ], [ 49.354839958075239, -17.147916332851821 ], [ 49.35410324053354, -17.148246000892236 ], [ 49.353076375025822, -17.148350567855832 ], [ 49.352479617011134, -17.148426315666232 ], [ 49.351884398166533, -17.148639857324067 ], [ 49.351147681186013, -17.14897006319784 ], [ 49.35048166857063, -17.149276708267134 ], [ 49.349626204877602, -17.149676883712345 ], [ 49.348556995220981, -17.150194301551519 ], [ 49.348389624660875, -17.150196703064285 ], [ 49.348078956230111, -17.150199973982208 ], [ 49.347456920130924, -17.150161528177371 ], [ 49.347024549362793, -17.150006182829379 ], [ 49.346469399469171, -17.14962277970573 ], [ 49.346200373845221, -17.149167551552559 ], [ 49.34622112411364, -17.148914802032618 ], [ 49.346359175405887, -17.148500010274244 ], [ 49.346689054111906, -17.148106198521219 ], [ 49.347086876652824, -17.147435869084067 ], [ 49.347197398132451, -17.146723294115901 ], [ 49.347188841229844, -17.146058153084478 ], [ 49.347011014467888, -17.145233982637706 ], [ 49.346567965817997, -17.144275797880642 ], [ 49.346082809398752, -17.143707936355746 ], [ 49.345622700933447, -17.143277988011736 ], [ 49.345042191099431, -17.142734033302613 ], [ 49.344483743808254, -17.14209821712457 ], [ 49.343731845768374, -17.141258534504292 ], [ 49.343075795472075, -17.140463201711995 ], [ 49.342828121848044, -17.139755207200054 ], [ 49.342698354858847, -17.138999250979086 ], [ 49.342572875621613, -17.138519323937416 ], [ 49.342536453818013, -17.137532668693648 ], [ 49.342811877096011, -17.136658010099104 ], [ 49.343185846720559, -17.135964754773799 ], [ 49.343914703768426, -17.135015241761753 ], [ 49.344716269797686, -17.134134141724612 ], [ 49.345570483573162, -17.133618734779024 ], [ 49.34699662345664, -17.132982134457222 ], [ 49.34813097296545, -17.131936440577849 ], [ 49.348484290488962, -17.131541742726593 ], [ 49.348947780706993, -17.130411837916746 ], [ 49.348763668872927, -17.129106580105869 ], [ 49.348171322434602, -17.127645169404857 ], [ 49.347963911229208, -17.126745297276443 ], [ 49.346977934293683, -17.125904096998962 ], [ 49.345256343940243, -17.125107003508834 ], [ 49.344214067921378, -17.124026252996998 ], [ 49.345094069105798, -17.121986654881216 ], [ 49.344789757972009, -17.120730985327338 ], [ 49.345507345080833, -17.119241549406475 ], [ 49.346612610263186, -17.117034369116698 ], [ 49.347621756109554, -17.115979021024938 ], [ 49.348346096827626, -17.114927750362156 ], [ 49.348668325402599, -17.113663105840157 ], [ 49.349095128045263, -17.11179433994295 ], [ 49.34866332129225, -17.109663958759469 ], [ 49.349491363109053, -17.107953793462663 ], [ 49.350261587243672, -17.106189670268467 ], [ 49.350242060030389, -17.104929920502698 ], [ 49.350159637002903, -17.103287585845667 ], [ 49.349672590454674, -17.10126756085096 ], [ 49.348876975000046, -17.099553264305218 ], [ 49.348046537364723, -17.097428581218683 ], [ 49.347970926654391, -17.096224414872342 ], [ 49.348241276472976, -17.095289214620582 ], [ 49.349506122792832, -17.096038074690163 ], [ 49.350296679289791, -17.095588474598227 ], [ 49.350894304516345, -17.093717253023716 ], [ 49.352348748051377, -17.091998099305208 ], [ 49.35410321418027, -17.091260745086569 ], [ 49.355053548010687, -17.090096645853102 ], [ 49.355671414898502, -17.089185255033808 ], [ 49.355382338594552, -17.087979778598914 ], [ 49.355029521499162, -17.086584382488574 ], [ 49.354895845496166, -17.085461935175719 ], [ 49.354669582835768, -17.084615815623625 ], [ 49.354223214845497, -17.083358937964185 ], [ 49.354040928727684, -17.082168275986881 ], [ 49.354077312995308, -17.081295842973965 ], [ 49.354161836909505, -17.080422719413693 ], [ 49.354391503043772, -17.079708972223372 ], [ 49.354808510628636, -17.078694446879911 ], [ 49.35506508747725, -17.078163859434209 ], [ 49.355627235120906, -17.077308162230505 ], [ 49.355833383709324, -17.076820099541418 ], [ 49.355929091250644, -17.076592830412924 ], [ 49.356301862920958, -17.075831302037159 ], [ 49.356794991300418, -17.075182773052251 ], [ 49.35745791302945, -17.074693172814939 ], [ 49.358361182387185, -17.074292304299384 ], [ 49.359192110776135, -17.073846105265368 ], [ 49.360001225575452, -17.073584310331615 ], [ 49.360906385419611, -17.073343676059263 ], [ 49.36207048294186, -17.072801773291122 ], [ 49.362426895421699, -17.072614199732282 ], [ 49.363256384628308, -17.072076553609964 ], [ 49.364038444710509, -17.071585313769535 ], [ 49.365320138702714, -17.070904431908009 ], [ 49.366793898946284, -17.070267143888422 ], [ 49.367631469722312, -17.070325636751409 ], [ 49.368087383390026, -17.070457984967629 ], [ 49.368849770366673, -17.07028837539692 ], [ 49.369158026554835, -17.07010093753809 ], [ 49.369393234305981, -17.069822550424394 ], [ 49.369675151298978, -17.069451945917528 ], [ 49.369929543789958, -17.068783648217529 ], [ 49.370142114172225, -17.068597587061333 ], [ 49.370422828784626, -17.068112363780166 ], [ 49.370774098670552, -17.06755730433057 ], [ 49.371221391087651, -17.067024499838748 ], [ 49.372072975977382, -17.066325594603491 ], [ 49.372857973435288, -17.066063462414164 ], [ 49.373503102446271, -17.066055891892194 ], [ 49.3739351533807, -17.066165389138213 ], [ 49.374631530315504, -17.066432072758413 ], [ 49.375038589784985, -17.066519385591409 ], [ 49.375327543637518, -17.066676124312512 ], [ 49.375736745306945, -17.066900674602415 ], [ 49.376122104886221, -17.067102385893964 ], [ 49.376768424407331, -17.067209331537093 ], [ 49.377436759172468, -17.067109321168559 ], [ 49.377981416884452, -17.066758733829243 ], [ 49.378357076286818, -17.066226402562922 ], [ 49.378828422697119, -17.065693236485107 ], [ 49.379281101567827, -17.065618971831757 ], [ 49.379783691131067, -17.065658529251245 ], [ 49.380216598559691, -17.065859545622786 ], [ 49.380700420388777, -17.066312825961475 ], [ 49.38101309329749, -17.066446670008048 ], [ 49.381612230162233, -17.066576917792631 ], [ 49.382235430192296, -17.066707363208216 ], [ 49.382570506330993, -17.066771971743972 ], [ 49.383168439872058, -17.066787597704664 ], [ 49.383909723994321, -17.066847420208163 ], [ 49.384675664738793, -17.066906974310491 ], [ 49.385223656735889, -17.06680868209536 ], [ 49.385652715196699, -17.066688380431295 ], [ 49.385983945385838, -17.066432317146329 ], [ 49.386244771292048, -17.066291268925035 ], [ 49.386529653027353, -17.066149963164815 ], [ 49.386977262177375, -17.065639760501472 ], [ 49.387898602681474, -17.064825607392709 ], [ 49.38884699472289, -17.064240328248868 ], [ 49.389275339092364, -17.06407494343749 ], [ 49.389919351677314, -17.063997791066225 ], [ 49.390397164876418, -17.063991956180082 ], [ 49.390851499649514, -17.06398655297167 ], [ 49.391497681182429, -17.064047729225209 ], [ 49.392524920192884, -17.064035103016636 ], [ 49.392837230637674, -17.064145752235284 ], [ 49.393174960899771, -17.064417031221137 ], [ 49.39310851978054, -17.064785082029541 ], [ 49.392852073913375, -17.065316251661859 ], [ 49.39264782884603, -17.066144202080274 ], [ 49.392917557986863, -17.066645738013175 ], [ 49.393282378226942, -17.067146439336774 ], [ 49.393552590397285, -17.067716783335086 ], [ 49.393587630126362, -17.068565079965808 ], [ 49.393524332000375, -17.06920807996789 ], [ 49.393462122813105, -17.069920520061984 ], [ 49.393146689245299, -17.071369622011559 ], [ 49.393100706900036, -17.07150746781128 ], [ 49.393009987202262, -17.071899052763364 ], [ 49.392806103161682, -17.072750180157563 ], [ 49.392507039925853, -17.073671597716519 ], [ 49.392096631150622, -17.07516789353776 ], [ 49.392060059647875, -17.076017685991705 ], [ 49.392307301632286, -17.076656723595022 ], [ 49.392794895066473, -17.077384908157853 ], [ 49.393109180427629, -17.077656524440282 ], [ 49.393734847001028, -17.078016164315155 ], [ 49.394599669707716, -17.078349782663022 ], [ 49.39558279918986, -17.078590225929005 ], [ 49.396853492806216, -17.078895846095325 ], [ 49.398121526424639, -17.078994864688184 ], [ 49.398694195986067, -17.078896175994476 ], [ 49.399357740766114, -17.07845226247445 ], [ 49.399564605667692, -17.077830356443041 ], [ 49.399992732000577, -17.077687403502718 ], [ 49.400541696405774, -17.077611689735306 ], [ 49.400896979074801, -17.077354614875492 ], [ 49.401514303273309, -17.077071817987417 ], [ 49.402088922870966, -17.077133999968162 ], [ 49.402591176760133, -17.077150412648493 ], [ 49.403095389858862, -17.077327703120584 ], [ 49.403864169835607, -17.077639498797392 ], [ 49.40496380653601, -17.077672024040663 ], [ 49.405819915803939, -17.077340463605744 ], [ 49.406369595999379, -17.077310450443125 ], [ 49.406848511012413, -17.077373466791162 ], [ 49.407375851950668, -17.077527866013824 ], [ 49.407833243419788, -17.077751644054899 ], [ 49.408507788838982, -17.078156248843936 ], [ 49.408916617244806, -17.078044071359898 ], [ 49.409343677136661, -17.079180816072757 ], [ 49.410736180401443, -17.081063103144484 ], [ 49.412337778344096, -17.082265832401951 ], [ 49.413372707652599, -17.083772798358421 ], [ 49.414962307928896, -17.08421463113806 ], [ 49.41725981958816, -17.08494204974339 ], [ 49.420074048263253, -17.084985383605417 ], [ 49.422707105305705, -17.084693094705077 ], [ 49.425898765246799, -17.083589248840021 ], [ 49.428263380557262, -17.083004873707921 ], [ 49.430456880947006, -17.082718950781139 ], [ 49.4313372355616, -17.082790564283741 ], [ 49.43222565849949, -17.083369415187597 ], [ 49.432330369716134, -17.084424875911836 ], [ 49.432578368921064, -17.086196988359266 ], [ 49.432514677091852, -17.087720006010841 ], [ 49.432495610382396, -17.089284646370526 ], [ 49.432735550451504, -17.090549513571524 ], [ 49.434166249652854, -17.092050527218984 ], [ 49.4362008610251, -17.092823871310742 ], [ 49.437837890118466, -17.09347621784319 ], [ 49.440808976057454, -17.096455388849229 ], [ 49.441507758114255, -17.097179407670168 ] ] ] } },
      //   ]
      // }`;

      // let name = "region";

      const body = { name, data };
      // https://spse.llanddev.org/
      const response = await fetch(
        "https://spse.llanddev.org/uploadLayer.php",
        {
          method: "POST",
          // mode: 'cors',
          body: JSON.stringify({ body }),
          headers: { "Content-Type": "application/json" },
        }
      );

      // log.info("reponse part 1");
      // log.info(JSON.stringify({ body }));
      log.info(response);
      log.info("reponse part 2");
      const reponse = await response.json();

      log.info("groupe de reponse part 1");
      log.info(response);
      log.info(reponse);
      // log.info(reponse.reponses.dados);
      log.info("groupe de reponse part 2");

      return reponse;
    } catch (err) {
      log.info(err);
      return false;
    }
  }

  async inscription(user) {
    try {
      user.id = Date.now() + "" + Math.floor(Math.random() * 10);
      const body = { user };

      const response = await fetch(
        "https://spse.llanddev.org/inscription.php",
        {
          method: "POST",
          // mode: 'cors',
          body: JSON.stringify({ body }),
          headers: { "Content-Type": "application/json" },
        }
      );

      log.info("reponse part 1");
      log.info(JSON.stringify({ body }));
      log.info(response);
      log.info("reponse part 2");
      const reponse = await response.json();

      log.info("groupe de reponse part 1");
      log.info(response);
      log.info(reponse);
      // log.info(reponse.reponses.dados);
      log.info("groupe de reponse part 2");

      return reponse;
    } catch (err) {
      log.info(err);
      return false;
    }
  }

  save(sheet) {
    log.info("exportation:");
    log.info(sheet);
    log.info("fin");

    const settings = {
      writeOptions: {
        type: "buffer",
        bookType: "xlsx",
      },
    };

    const buffer = xlsx(sheet, settings);

    dialog
      .showSaveDialog({
        title: "Choisir l'emplacement du fichier",
        defaultPath: path.join(__dirname, "canevas.xlsx"),
        // defaultPath: path.join(__dirname, '../assets/'),
        buttonLabel: "Enregistrer",
        // Restricting the user to only Text Files.
        filters: [
          {
            name: "Text Files",
            extensions: ["xlsx", "csv"],
          },
        ],
        properties: [],
      })
      .then((file) => {
        // Stating whether dialog operation was cancelled or not.
        log.info(file.canceled);
        if (!file.canceled) {
          log.info(file.filePath.toString());

          // Creating and Writing to the sample.txt file
          fs.writeFile(file.filePath.toString(), buffer, function (err) {
            if (err) throw err;
            log.info("Saved!");
          });
        }
        return true;
      })
      .catch((err) => {
        log.info(err);
        return false;
      });
  }

  /**
   * @name isIsoDate
   * @description Check if a given String is ISO Date as
   * readXlsxFile return date as ISO
   * @param {String} str
   *
   * @returns {Boolean}
   */
  isIsoDate(str) {
    try {
      var d = new Date(str);
      return d.toString() == str;
    } catch (error) {
      return false;
    }
  }

  /**
   * @name readPTA
   * @description Read the PTA file and import to the database
   * @param {Number} userId
   *
   * @returns {Boolean}
   */
  async readPTA(userId, districtId, repo) {
    let valiny = false;
    let colIndicateur = null;
    let colValeur = null;
    let daty = new Date();

    let pta = [];

    try {
      const file = await dialog.showOpenDialog({
        title: "Choisir le PTA à importer",
        defaultPath: path.join(__dirname, "pta.xlsx"),
        buttonLabel: "Importer",
        filters: [
          {
            name: "Text Files",
            extensions: ["xlsx", "csv"],
          },
        ],
        properties: [],
      });
      if (!file.canceled) {
        // upload the file
        const newName = file.filePaths[0].substring(
          file.filePaths[0].lastIndexOf("\\")+1,
          file.filePaths[0].lastIndexOf(".")
        )+new Date().getTime().toString()+".xlsx";
        log.info(newName);
        
        const upload = await this.uploadZip(file, newName);

        const rows = await readXlsxFile(fs.createReadStream(file.filePaths[0]));
        let indicateurs = await repo.all();
        if (rows.length > 1) {
          // find the column of indicateur and cible annuel
          let breakLimit = 0;
          for (let i = 0; i < rows[0].length; i++) {
            if (rows[0][i] == "Indicateurs") {
              colIndicateur = i;
              breakLimit++;
            }
            if (rows[0][i] == "Cible annuel") {
              colValeur = i;
              breakLimit++;
            }
            if (breakLimit == 2) {
              break;
            }
          }
          // get all value for each indicateur
          rows.forEach((row) => {
            // check if the indicateur in xslx is in the database
            let temp = null;
            if (row[colIndicateur]) temp = row[colIndicateur].split("[")[0];
            const ind = indicateurs.find((element) => element.label == temp);
            if (ind != undefined) {
              //The indicateur exist
              if (row[colValeur]) {
                let ptaTemp = {};
                ptaTemp.date =
                  (daty.getDate() > 9 ? daty.getDate() : "0" + daty.getDate()) +
                  "-" +
                  (daty.getMonth() + 1 > 9
                    ? daty.getMonth() + 1
                    : "0" + (daty.getMonth() + 1)) +
                  "-" +
                  daty.getFullYear();
                ptaTemp.valeur = row[colValeur];
                ptaTemp.indicateur_id = ind.id;
                ptaTemp.district_id = districtId;
                ptaTemp.user_id = userId;
                ptaTemp.file = newName;
                pta.push(ptaTemp);
              }
            }
          });

          log.info("PTA : valeur");
          log.info(colValeur);
          log.info(pta);

          repo.table = "pta";

          repo.deleteWhere({
            date: daty.getFullYear(),
            district_id: districtId,
          });

          for (let i = 0; i < pta.length; i++) {
            let temp = await repo.create(pta[i]);
          }
          valiny = true;
        } else {
          throw new Error("Le canevas est vide");
        }
      } else {
        log.info("Import PTA canceled");
      }
    } catch (error) {
      log.error(error);
      valiny = false;
    }

    return new Promise((resolve, reject) => {
      resolve(valiny);
    });
  }

  async read(userId, repo, responseRepository) {
    let valiny = true;
    let val = [];
    try {
      const file = await dialog.showOpenDialog({
        title: "Choisir le fichier à importer",
        defaultPath: path.join(__dirname, "canevas.xlsx"),
        buttonLabel: "Importer",
        filters: [
          {
            name: "Text Files",
            extensions: ["xlsx", "csv"],
          },
        ],
        properties: [],
      });
      if (!file.canceled) {
        const rows = await readXlsxFile(fs.createReadStream(file.filePaths[0]));
        let questions = await repo.all();
        let qst = [];

        // check obligatory field
        questions.forEach((element) => {
          let temp = element;
          element.obligatoire == 1
            ? (temp.question = "* " + element.question)
            : 0;
          qst.push(temp);
        });

        questions = qst;

        let idQuestions = [];
        repo.table = "reponse_non_valide";

        if (rows.length > 1) {
          let deleted = false;
          for (let index = 0; index < rows.length; index++) {
            let lineId = Date.now() + "" + Math.floor(Math.random() * 10);
            for (let i = 0; i < rows[index].length; i++) {
              if (index == 0) {
                let temp = questions.find(
                  (elm) => elm.question == rows[index][i]
                );

                if (temp) {
                  log.info("questions *****");
                  log.info(questions);
                  log.info(rows[index][i]);
                  log.info(temp);
                  log.info("-----------");

                  idQuestions[i] = temp.id;
                  if (!deleted) {
                    log.info("go delete from id_question = " + temp.id);
                    const del = await responseRepository.deleteAllNonValide(
                      userId,
                      temp.id
                    );
                    log.info("deleted from id_question = " + temp.id);
                  }
                }
              } else {
                if (rows[index][i] != null) {
                  let reponse = {
                    line_id: lineId,
                    user_id: userId,
                    date: repo.formatDate(new Date()),
                    question_id: idQuestions[i],
                    reponse: this.isIsoDate(rows[index][i])
                      ? new Date(rows[index][i]).toLocaleDateString("fr-FR")
                      : rows[index][i],
                    comment: 0,
                  };
                  val.push(reponse);
                } else {
                  let temp = questions.find(
                    (elm) => elm.question == rows[0][i]
                  );
                  if (temp && temp.obligatoire == 1) {
                    log.info(
                      "La colonne : " + temp.question + " est obligatoire"
                    );
                    valiny =
                      "La colonne : " + temp.question + " est obligatoire.";
                  }
                }
              }
            }
          }
        } else {
          throw new Error("Le canevas est vide");
        }
      } else {
        throw new Error("L'opération a été annulé");
      }
    } catch (error) {
      log.info(error);
      valiny = false;
    }

    if (valiny == true) {
      for (let index = 0; index < val.length; index++) {
        let temp = await repo.create(val[index]);
      }
    }

    return new Promise((resolve, reject) => {
      resolve(valiny);
    });
  }

  async upload() {
    let valiny = true;
    try {
      const file = await dialog.showOpenDialog({
        title: "Choisir le fichier à importer",
        defaultPath: path.join(__dirname, "canevas.xlsx"),
        buttonLabel: "Importer",
        filters: [
          {
            name: "Text Files",
            extensions: ["xlsx", "csv", "geojson"],
          },
        ],
        properties: [],
      });
      if (!file.canceled) {
        const data = JSON.parse(fs.readFileSync(file.filePaths[0]));
        valiny = await this.uploadGeojson(
          file.filePaths[0].replace(/^.*[\\\/]/, "").replace(".geojson", ""),
          data
        );
      } else {
        throw new Error("L'opération a été annulé");
      }
    } catch (error) {
      log.info(error);
      valiny = false;
    }

    return new Promise((resolve, reject) => {
      resolve(valiny);
    });
  }

  /**
   * @name getMaps
   * @description Get all geojson data in the server
   *
   * @return {Array} the list of geosjon as array of json
   */
  async getMaps(
    thematique = 1,
    year = "2022",
    dao,
    table = "reponse_non_valide"
  ) {
    try {
      const reponseRepository = new ReponseRepository(dao);
      const resp = await reponseRepository.findReponsesByThematique(
        {
          date: year,
          thid: thematique,
        },
        null,
        table
      );

      let geojsons = resp.filter((item) => {
        if (item.reponse) {
          log.info("tralalalall xxxxxxxxxxx");
          log.info(item.reponse);
          return item.reponse.toString().includes(".geojson");
        }
      });

      // const geojsons = await this.getListMaps();

      log.info("getMaps: list maps");
      log.info(geojsons);
      log.info("-------------------------------");

      const valiny = [];

      for (let i = 0; i < geojsons.length; i++) {
        try {
          const response = await fetch(
            "https://spse.llanddev.org/layer/" +
              geojsons[i].reponse.replace(".geojson", ".json"),
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            }
          );

          const data = await response.json();

          log.info("getListMaps: each geojson");
          log.info("https://spse.llanddev.org/layer/" + geojsons[i]);
          log.info("-----------------------------------");

          valiny.push(data);
        } catch (error) {
          continue;
        }
      }

      log.info("getListMaps: valiny");
      log.info(valiny);

      return valiny;
    } catch (err) {
      log.info(err);
      return false;
    }
  }

  /**
   * @name getListMaps
   * @description Get the list of maps
   *
   * @return {*} list of maps
   */
  async getListMaps() {
    try {
      const response = await fetch("https://spse.llanddev.org/listMaps.php", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      log.info("getListMaps:");
      log.info(Object.values(data));
      log.info("-----------------------------------");

      return Object.values(data);
    } catch (err) {
      log.info(err);
      return false;
    }
  }

  /**
   * @name uploadFile
   * @description Upload zip file=
   * @param {String} extension The extension of the file to upload
   *
   * @returns {Boolean} True if uploaded, false overwise
   */
  async uploadFile(extension = "zip") {
    let valiny = true;
    try {
      const file = await dialog.showOpenDialog({
        title: "Choisir le fichier à importer",
        defaultPath: path.join(__dirname, "canevas.xlsx"),
        buttonLabel: "Importer",
        filters: [
          {
            name: "Zip Files",
            extensions: [extension],
          },
        ],
        properties: [],
      });
      if (!file.canceled) {
        valiny = await this.uploadZip(file);
      } else {
        throw new Error("L'opération a été annulé");
      }
    } catch (error) {
      log.info(error);
      valiny = false;
    }

    return new Promise((resolve, reject) => {
      resolve(valiny);
    });
  }

  async uploadZip(file, name = null) {
    try {
      const form = new FormData();
      const stats = fs.statSync(file.filePaths[0]);
      const fileSizeInBytes = stats.size;
      const fileStream = fs.createReadStream(file.filePaths[0]);
      let newName = "";

      var copyFileStream = fileStream;
      if (name != null) {
        log.info("uploadZip : name != null");

        // path ofthe copied file
        newName =
          file.filePaths[0].substring(
            0,
            file.filePaths[0].lastIndexOf("\\") + 1
          ) + name;
        log.info("uploadZip : new name = " + newName);

        // create Promise to handle asynchronously
        var end = new Promise((resolve, reject) => {
          // copy file with the correct name to upload
          fileStream.pipe(
            fs.createWriteStream(newName).on("finish", () => {
              log.info("uploadZip : copy done");
              resolve(true);
            })
          );
        });

        // get the copied file on finished
        let temp = await end; //wait for resolve before continuing
        copyFileStream = fs.createReadStream(newName);
        log.info("uploadZip : copied file uploaded");
      }

      form.append("file", copyFileStream, { knownLength: fileSizeInBytes });
      const options = {
        method: "POST",
        credentials: "include",
        body: form,
      };
      const response = await fetch("https://spse.llanddev.org/uploadFile.php", {
        ...options,
      });

      log.info(response);
      log.info("reponse part 2");
      const reponse = await response.json();

      log.info("groupe de reponse part 1");
      log.info(response);
      log.info("groupe de reponse part 2");
      log.info(reponse);

      // Delete copied file
      if (name != null) {
        fs.unlink(newName, (err) => {
          err ? log.info(err) : log.info(newName + "deleted");
        });
      }

      return reponse;
    } catch (err) {
      log.info(err);
      return false;
    }
  }
}

module.exports = Exportation;
