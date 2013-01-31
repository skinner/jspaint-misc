/* 
 * Package: version.js
 * 
 * Namespace: amigo.version
 * 
 * This package was automatically created during the release process
 * and contains its version information--this is the release of the 
 * API that you have.
 */

bbop.core.namespace('amigo', 'version');
amigo.version = {};

/*
 * Variable: revision
 *
 * Partial version for this library; revision (major/minor version numbers)
 * information.
 */
amigo.version.revision = "0.9";

/*
 * Variable: release
 *
 * Partial version for this library: release (date-like) information.
 */
amigo.version.release = "20130108";
/*
 * Package: api.js
 * 
 * Namespace: amigo.api
 * 
 * Core for AmiGO 2 remote functionality.
 * 
 * Provide methods for accessing AmiGO/GO-related web resources from
 * the host server. A loose analog to the perl AmiGO.pm top-level.
 * 
 * This module should contain nothing to do with the DOM, but rather
 * methods to access and make sense of resources provided by AmiGO and
 * its related services on the host.
 * 
 * WARNING: This changes very quickly as parts get spun-out into more
 * stable packages.
 */

// Module and namespace checking.
bbop.core.require('bbop', 'core');
bbop.core.namespace('amigo', 'api');

/*
 * Constructor: api
 * 
 * Contructor for the AmiGO API object.
 * Hooks to useful things back on AmiGO.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  AmiGO object
 */
amigo.api = function(){

    ///
    /// General AmiGO (perl server) AJAX response checking (after
    /// parsing).
    ///

    this.response = {};

    // Check to see if the server thinks we were successful.
    this.response.success = function(robj){
	var retval = false;
	if( robj && robj.success && robj.success == 1 ){
	    retval = true;
	}
	return retval;
    };

    // Check to see what the server thinks about its own condition.
    this.response.type = function(robj){
	var retval = 'unknown';
	if( robj && robj.type ){
	    retval = robj.type;
	}
	return retval;
    };

    // Check to see if the server thinks the data was successful.
    this.response.errors = function(robj){
	var retval = new Array();
	if( robj && robj.errors ){
	    retval = robj.errors;
	}
	return retval;
    };

    // Check to see if the server thinks the data was correct.
    this.response.warnings = function(robj){
	var retval = new Array();
	if( robj && robj.warnings ){
	    retval = robj.warnings;
	}
	return retval;
    };

    // Get the results chunk.
    this.response.results = function(robj){
	var retval = {};
	if( robj && robj.results ){
	    retval = robj.results;
	}
	return retval;
    };

    // Get the arguments chunk.
    this.response.arguments = function(robj){
	var retval = {};
	if( robj && robj.arguments ){
	    retval = robj.arguments;
	}
	return retval;
    };

    ///
    /// Workspaces' linking.
    ///

    function _abstract_head_template(head){
	return head + '?';
    }

    // Convert a hash (with possible arrays as arguments) into a link
    // string.
    // NOTE: Non-recursive--there are some interesting ways to create
    // cyclic graph hashes in SpiderMonkey, and I'd rather not think
    // about it right now.
    function _abstract_segment_template(segments){
	
	var maxibuf = new Array();
	for( var segkey in segments ){

	    var segval = segments[segkey];

	    // If the value looks like an array, iterate over it and
	    // collect.
	    if( segval &&
		segval != null &&
		typeof segval == 'object' &&
		segval.length ){

		for( var i = 0; i < segval.length; i++ ){
		    var minibuffer = new Array();
		    minibuffer.push(segkey);
		    minibuffer.push('=');
		    minibuffer.push(segval[i]);
		    maxibuf.push(minibuffer.join(''));
		}

	    }else{
		var minibuf = new Array();
		minibuf.push(segkey);
		minibuf.push('=');
		minibuf.push(segval);
		maxibuf.push(minibuf.join(''));
	    }
	}
	return maxibuf.join('&');
    }

    // Similar to the above, but creating a solr filter set.
    function _abstract_solr_filter_template(filters){
	
	var allbuf = new Array();
	for( var filter_key in filters ){

	    var filter_val = filters[filter_key];

	    // If the value looks like an array, iterate over it and
	    // collect.
	    if( filter_val &&
		filter_val != null &&
		typeof filter_val == 'object' &&
		filter_val.length ){

		    for( var i = 0; i < filter_val.length; i++ ){
			var minibuffer = new Array();
			var try_val = filter_val[i];
			if( typeof(try_val) != 'undefined' &&
			try_val != '' ){
			    minibuffer.push('fq=');
			    minibuffer.push(filter_key);
			    minibuffer.push(':');
			    minibuffer.push('"');
			    minibuffer.push(filter_val[i]);
			    minibuffer.push('"');
			    allbuf.push(minibuffer.join(''));
			}
		    }		    
		}else{
		    var minibuf = new Array();
		    if( typeof(filter_val) != 'undefined' &&
			filter_val != '' ){
			    minibuf.push('fq=');
			    minibuf.push(filter_key);
			    minibuf.push(':');
			    minibuf.push('"');
			    minibuf.push(filter_val);
			    minibuf.push('"');
			    allbuf.push(minibuf.join(''));
			}
		}
	}
	return allbuf.join('&');
    }

    // Construct the templates using head and segments.
    function _abstract_link_template(head, segments){	
	return _abstract_head_template(head) +
	    _abstract_segment_template(segments);
    }

    // // Construct the templates using the segments.
    // function _navi_client_template(segments){
    // 	segments['mode'] = 'layers_graph';
    // 	return _abstract_link_template('amigo_exp', segments);
    // }

    // // Construct the templates using the segments.
    // function _navi_data_template(segments){
    // 	segments['mode'] = 'navi_js_data';
    // 	return _abstract_link_template('aserve_exp', segments);
    // }

    // Construct the templates using the segments.
    function _ws_template(segments){
	segments['mode'] = 'workspace';
	return _abstract_link_template('amigo_exp', segments);
    }

    // // Construct the templates using the segments.
    // function _ls_assoc_template(segments){
    // 	segments['mode'] = 'live_search_association';
    // 	return _abstract_link_template('aserve', segments);
    // }
    // function _ls_gp_template(segments){
    // 	segments['mode'] = 'live_search_gene_product';
    // 	return _abstract_link_template('aserve', segments);
    // }
    // function _ls_term_template(segments){
    // 	segments['mode'] = 'live_search_term';
    // 	return _abstract_link_template('aserve', segments);
    // }

    // Construct the templates using the segments.
    function _completion_template(segments){
    	return _abstract_link_template('completion', segments);
    }

    // // Construct the templates using the segments.
    // function _nmatrix_template(segments){
    // 	segments['mode'] = 'nmatrix';
    // 	return _abstract_link_template('amigo_exp', segments);
    // }

    this.api = {};
    this.link = {};
    this.html = {};

    //     // Some handling for a workspace object once we get one.
    //     this.util.workspace = {};
    //     this.util.workspace.get_terms = function(ws){
    // 	var all_terms = new Array();
    // 	for( var t = 0; t < ws.length; t++ ){
    // 	    var item = ws[t];
    // 	    if( item.type == 'term' ){
    // 		all_terms.push(item.key);
    // 	    }
    // 	}
    // 	return all_terms;
    //     };

    ///
    /// JSON? JS? API functions for workspaces.
    ///

    this.workspace = {};

    this.workspace.remove = function(ws_name){
	return _ws_template({
	    action: 'remove_workspace',
	    workspace: ws_name
	});
    };
    this.workspace.add = function(ws_name){
	return _ws_template({
	    action: 'add_workspace',
	    workspace: ws_name
	});
    };
    this.workspace.copy = function(ws_from_name, ws_to_name){
	return _ws_template({
	    action: 'copy_workspace',
	    workspace: ws_from_name,
	    copy_to_workspace: ws_to_name
	});
    };
    this.workspace.clear = function(ws_name){
	return _ws_template({
	    action: 'clear_workspace',
	    workspace: ws_name
	});
    };
    this.workspace.list = function(ws_name){
	return _ws_template({
	    action: 'list_workspaces',
	    workspace: ws_name
	});
    };

    // API functions for workspace items.
    //     this.workspace.add_item = function(ws_name, key, type, name){
    this.workspace.add_item = function(ws_name, key, name){
	return _ws_template({
	    action: 'add_item',
	    workspace: ws_name,
	    key: key,
            // _t_y_p_e_: _t_y_p_e_, // prevent naturaldocs from finding this
	    name: name
	});
    };
    this.workspace.remove_item = function(ws_name, key){
	return _ws_template({
	    action: 'remove_item',
	    workspace: ws_name,
	    key: key
	});
    };
    this.workspace.list_items = function(ws_name){
	return _ws_template({
	    action: 'list_items',
	    workspace: ws_name
	});
    };

    // Just the workspace and item status. Essentially do nothing and
    // link to the current session status.
    this.workspace.status = function(){
	return _ws_template({ action: '' });
    };

    ///
    /// API function for completion/search information.
    ///

    this.completion = function(args){

	var format = 'amigo';
	var type = 'general';
	var ontology = null;
	var narrow = 'false';
	var query = '';
	if( args ){
	    if( args['format'] ){ format = args['format']; }
	    if( args['type'] ){ type = args['type']; }
	    if( args['ontology'] ){ontology = args['ontology']; }
	    if( args['narrow'] ){narrow = args['narrow']; }
	    if( args['query'] ){query = args['query']; }
	}

	return _completion_template({format: format,
				     type: type,
				     ontology: ontology,
				     narrow: narrow,
				     query: encodeURIComponent(query)});
    };

    ///
    /// API functions for live search.
    ///
    this.live_search = {};

    // General search:
    // http://accordion.lbl.gov:8080/solr/select?indent=on&version=2.2&q=annotation_class_label%3Abinding&fq=&start=0&rows=10&fl=*%2Cscore&qt=standard&wt=json&explainOther=&hl.fl=
    // Facet on date:
    // http://accordion.lbl.gov:8080/solr/select?indent=on&version=2.2&q=annotation_class_label%3Abinding&fq=&start=0&rows=10&fl=*%2Cscore&qt=standard&wt=json&explainOther=&hl.fl=&facet=true&facet.field=date    
    this.live_search.golr = function(in_args){

	if( ! in_args ){ in_args = {}; }
	var default_query_args =
	    {
		// TODO/BUG? need jsonp things here?
		qt: 'standard',
		indent: 'on',
		wt: 'json',
		version: '2.2',
		rows: 10,
		//start: 1,
		start: 0, // Solr is offset indexing
		fl: '*%2Cscore',

		// Control of facets.
		facet: '',
		'facet.field': [],

		// Facet filtering.
		fq: [],

		// Query-type stuff.
		q: '',

		// Our bookkeeping.
		packet: 0
	    };
	var final_query_args = bbop.core.fold(default_query_args, in_args);
		
	var default_filter_args =
	    {
		// Filter stuff.
		document_category: [],
		type: [],
		source: [],
		taxon: [],
		evidence_type: [],
		evidence_closure: [],
		isa_partof_label_closure: [],
		annotation_extension_class_label: [],
		annotation_extension_class_label_closure: []
	    };
	var final_filter_args = bbop.core.fold(default_filter_args, in_args);

	// ...
	//return _abstract_link_template('select', segments);	
	var complete_query = _abstract_head_template('select') +
	    _abstract_segment_template(final_query_args);
	var addable_filters = _abstract_solr_filter_template(final_filter_args);
	if( addable_filters.length > 0 ){
	    complete_query = complete_query + '&' + addable_filters;
	}
	return complete_query;
    };

    ///
    /// API functions for the ontology.
    ///
    this.ontology = {};
    this.ontology.roots = function(){
	return _abstract_link_template('aserve_exp', {'mode': 'ontology'});
    };

    ///
    /// API functions for navi js data.
    ///

    this.navi_js_data = function(args){

	if( ! args ){ args = {}; }

	var final_args = {};

	// Transfer the name/value pairs in opt_args into final args
	// if extant.
	var opt_args = ['focus', 'zoom', 'lon', 'lat'];
	//var opt_args_str = '';
	for( var oa = 0; oa < opt_args.length; oa++ ){
	    var arg_name = opt_args[oa];
	    if( args[arg_name] ){
		// opt_args_str =
		// opt_args_str + '&' + arg_name + '=' + args[arg_name];
		final_args[arg_name] = args[arg_name];
	    }
	}

	//
	var terms_buf = new Array();
	if( args.terms &&
	    args.terms.length &&
	    args.terms.length > 0 ){

	    //
	    for( var at = 0; at < args.terms.length; at++ ){
		terms_buf.push(args.terms[at]);
	    } 
	}
	final_args['terms'] = terms_buf.join(' '); 

	return _navi_data_template(final_args);
    };

    ///
    /// Links for terms and gene products.
    ///

    function _term_link(in_args){

	if( ! in_args ){ in_args = {}; }
	var default_args =
	    {
		acc: ''
	    };
	var final_args = bbop.core.fold(default_args, in_args);
	
	var acc = final_args['acc'];
	//return 'term_details?term=' + acc;
	return 'amigo?mode=golr_term_details&term=' + acc;
    }
    this.link.term = _term_link;

    // BUG/TODO: should this actually be in widgets? How core is this
    // convenience?
    this.html.term_link = function(acc, label){
	if( ! label ){ label = acc; }
	return '<a title="Go to term details page for ' + label +
	    '." href="' + _term_link({acc: acc}) + '">' + label +'</a>';
    };

    function _gene_product_link(in_args){

	if( ! in_args ){ in_args = {}; }
	var default_args =
	    {
		acc: ''
	    };
	var final_args = bbop.core.fold(default_args, in_args);
	
	var acc = final_args['acc'];
	//return 'gp-details.cgi?gp=' + acc;
	return 'amigo?mode=golr_gene_product_details&gp=' + acc;
    }
    this.link.gene_product = _gene_product_link;

    // BUG/TODO: should this actually be in widgets? How core is this
    // convenience?
    this.html.gene_product_link = function(acc, label){
	if( ! label ){ label = acc; }
	return '<a title="Go to gene product details page for ' + label +
	    '." href="' + _gene_product_link({acc: acc}) + '">' + label +'</a>';
    };

    ///
    /// Links for term product associations.
    ///

    this.link.term_assoc = function(in_args){

	if( ! in_args ){ in_args = {}; }
	var default_args =
	    {
		acc: '',
		speciesdb: [],
		taxid: []
	    };
	var final_args = bbop.core.fold(default_args, in_args);
	var acc = final_args['acc'];
	var speciesdbs = final_args['speciesdb'];
	var taxids = final_args['taxid'];

	//
	var spc_fstr = speciesdbs.join('&speciesdb');
	var tax_fstr = taxids.join('&taxid=');
	//core.kvetch('LINK SRCS: ' + spc_fstr);
	//core.kvetch('LINK TIDS: ' + tax_fstr);

	return 'term-assoc.cgi?term=' + acc +
	    '&speciesdb=' + spc_fstr +
	    '&taxid=' + tax_fstr;
    };

    ///
    /// Link function for blast.
    ///

    this.link.single_blast = function(in_args){

	if( ! in_args ){ in_args = {}; }
	var default_args =
	    {
		acc: ''
	    };
	var final_args = bbop.core.fold(default_args, in_args);
	
	var acc = final_args['acc'];
	return 'blast.cgi?action=blast&seq_id=' + acc;
    };

    ///
    /// Link function for term enrichment.
    ///

    this.link.term_enrichment = function(in_args){

	if( ! in_args ){ in_args = {}; }
	var default_args =
	    {
		gp_list: [] 
	    };
	var final_args = bbop.core.fold(default_args, in_args);
	
	var acc = final_args['acc'];
	return 'term_enrichment?' +
	    'gp_list=' + final_args['gp_list'].join(' ');
    };

    ///
    /// Link function for slimmer.
    ///

    this.link.slimmer = function(in_args){

	if( ! in_args ){ in_args = {}; }
	var default_args =
	    {
		gp_list: [], 
		slim_list: []
	    };
	var final_args = bbop.core.fold(default_args, in_args);
	
	return 'slimmer?' +
	    'gp_list=' + final_args['gp_list'].join(' ') +
	    '&slim_list=' + final_args['slim_list'].join(' ');
    };

    ///
    /// Link function for N-Matrix.
    ///

    this.link.nmatrix = function(in_args){

	if( ! in_args ){ in_args = {}; }
	var default_args =
	    {
		term_set_1: '',
		term_set_2: ''
	    };
	var final_args = bbop.core.fold(default_args, in_args);

	//
	var terms_buf = new Array();
	if( in_args.terms &&
	    in_args.terms.length &&
	    in_args.terms.length > 0 ){

		//
	    for( var at = 0; at < in_args.terms.length; at++ ){
		terms_buf.push(in_args.terms[at]);
	    } 
	}
	final_args['term_set_1'] = terms_buf.join(' '); 
	final_args['term_set_2'] = terms_buf.join(' '); 

	return _nmatrix_template(final_args);
    };

    ///
    /// Link functions for navi client (bookmark).
    ///

    this.link.layers_graph = function(args){

	//
	var final_args = {};
	if( args['lon'] &&
	    args['lat'] &&
	    args['zoom'] &&
	    args['focus'] ){

	    //
	    final_args['lon'] = args['lon'];
	    final_args['lat'] = args['lat'];
	    final_args['zoom'] = args['zoom'];
	    final_args['focus'] = args['focus'];
	}

	if( args['terms'] &&
	    args['terms'].length &&
	    args['terms'].length > 0 ){

	    //
	    var aterms = args['terms'];
	    var terms_buf = new Array();
	    for( var at = 0; at < aterms.length; at++ ){
		terms_buf.push(aterms[at]);
	    }
	    final_args['terms'] = terms_buf.join(' '); 
	}
	
	return _navi_client_template(final_args);
    };

    // TODO:
};
/* 
 * Package: linker.js
 * 
 * Namespace: amigo.linker
 * 
 * Generic AmiGO linking function. A real function mind you--not an
 * object generator.
 * 
 * TODO: maybe this should actually be under bbop.html so we could
 * make use of the anchor tag stuff?
 * 
 * NOTE: A lot of this is lifted from the (defunct) amigo.js
 * package. However, the future should be here.
 * 
 * NOTE: This should pull data from something like amigo.data.xrefs
 * instead.
 */

// Setup the internal requirements.
bbop.core.require('bbop', 'core');
//bbop.core.require('bbop', 'logger');
bbop.core.namespace('amigo', 'linker');

/*
 * Constructor: linker
 * 
 * Create an object that can make URLs and/or anchors.
 * 
 * These functions have a well defined interface so that other
 * packages can use it.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  self
 */
amigo.linker = function (){
    this._is_a = 'amigo.linker';
};

/*
 * Function: url
 * 
 * Return a url string.
 * 
 * Arguments:
 *  args - id
 *  xid - *[optional]* an internal transformation id
 * 
 * Returns:
 *  string (url); null if it couldn't create anything
 */
amigo.linker.prototype.url = function (id, xid){
    
    var retval = null;

    // AmiGO hard-coded link types.
    if( xid ){
	if( xid == 'term' ||
	    xid == 'annotation_class' ||
	    xid == 'ontology_class' ){
		retval = 'amigo?mode=golr_term_details&term=' + id;
        }else if( xid == 'gp' ||
		  xid == 'gene_product' ||
		  xid == 'bioentity' ){
	        retval = 'amigo?mode=golr_gene_product_details&gp=' + id;
        }
    }

    // Since we couldn't find anything with our explicit
    // transformation set, drop into the great abyss of the xref data.
    if( ! retval){
	if( ! amigo.data.xrefs ){
	    throw new Error('amigo.data.xrefs is missing!');
	}

	// First, extract the probable source and break it into parts.
	var full_id_parts = bbop.core.first_split(':', id);
	if( full_id_parts && full_id_parts[0] && full_id_parts[1] ){
	    var src = full_id_parts[0];
	    var sid = full_id_parts[1];

	    // Now, check to see if it is indeed in our store.
	    var lc_src = src.toLowerCase();
	    var xref = amigo.data.xrefs[lc_src];
	    if( xref && xref['url_syntax'] ){
		retval = xref['url_syntax'].replace('[example_id]', sid);
	    }
	}
    }
    
    return retval;
};

/*
 * Function: anchor
 * 
 * Return a link as a chunk of HTML, all ready to consume in a
 * display.
 * 
 * Arguments:
 *  args - hash--'id' required; 'label' and 'hilite' are inferred if not extant
 *  xid - *[optional]* an internal transformation id
 * 
 * Returns:
 *  string (link); null if it couldn't create anything
 */
amigo.linker.prototype.anchor = function(args, xid){
    
    var anchor = this;
    var retval = null;

    // Get what fundamental arguments we can.
    var id = args['id'];
    if( ! id ){ 
	throw new Error('"id" is a required argument');
    }

    // Infer label from id if not present.
    var label = args['label'];
    if( ! label ){ label = id; }

    // Infer label from id if not present.
    var hilite = args['hilite'];
    if( ! hilite ){ hilite = label; }

    // See if the URL is legit. If it is, make something for it.
    var url = this.url(id, xid);
    if( url ){
	
	// First, see if it is one of the internal ones we know about
	// and make something special for it.
	if( xid ){
	    if( xid == 'term' ||
		xid == 'annotation_class' ||
		xid == 'ontology_class' ){
		    retval = '<a title="Go to the term details page for ' +
			label +	'." href="' + url + '">' + hilite + '</a>';
            }else if( xid == 'gp' ||
		      xid == 'gene_product' ||
		      xid == 'bioentity' ){
		    retval = '<a title="Go to the gene product ' +
			      'details page for ' + label +
			      '." href="' + url + '">' + hilite + '</a>';
	    }
	}

	// If it wasn't in the special transformations, just make
	// something generic.
	if( ! retval ){
	    retval = '<a title="Go to the page for ' + label +
		'." href="' + url + '">' + hilite + '</a>';
	}
    }

    return retval;
};
/* 
 * Package: golr.js
 * 
 * Namespace: amigo.data.golr
 * 
 * This package was automatically created during an AmiGO 2 installation
 * from the YAML configuration files that AmiGO pulls in.
 *
 * Useful information about GOlr. See the package <golr_conf.js>
 * for the API to interact with this data file.
 *
 * NOTE: This file is generated dynamically at installation time.
 * Hard to work with unit tests--hope it's not too bad. You have to
 * occasionally copy back to keep the unit tests sane.
 *
 * NOTE: This file has a slightly different latout from the YAML
 * configurations files--in addition instead of the fields
 * being in lists (fields), they are in hashes keyed by the
 * field id (fields_hash).
 */

// All of the server/instance-specific meta-data.
bbop.core.require('bbop', 'core');
bbop.core.namespace('amigo', 'data', 'golr');

/*
 * Variable: golr
 * 
 * The configuration for the data.
 * Essentially a JSONification of the OWLTools YAML files.
 * This should be consumed directly by <bbop.golr.conf>.
 */
amigo.data.golr = {
   "bbop_bio" : {
      "searchable_extension" : "_searchable",
      "result_weights" : "bioentity^6.0 taxon^4.0 family_tag^3.0 type^2.0 db^1.0",
      "filter_weights" : "db^7.0 type^6.0 family_tag_label^5.0 taxon_closure_label^4.0 isa_partof_closure_label^3.0",
      "_infile" : "/home/bbop/local/src/svn/geneontology/AmiGO/trunk/metadata//bio-config.yaml",
      "display_name" : "Bioentities",
      "description" : "A description of bioentities file for GOlr.",
      "boost_weights" : "bioentity^2.0 bioentity_label^2.0  isa_partof_closure_label^1.0 family_tag^1.0 family_tag_label^1.0",
      "fields" : [
         {
            "transform" : [],
            "description" : "Bioentity ID.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "id",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Bioentity ID.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Symbol or name.",
            "display_name" : "Label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 12: type class id.",
            "display_name" : "Type class id",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "type",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 13: taxon.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon closure",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon closure (labels)",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Closure of ids/accs over isa and partof.",
            "display_name" : "Is-a/Part-of closure",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Closure of labels over isa and partof.",
            "display_name" : "Is-a/Part-of closure (labels)",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 1: Identifier database.",
            "display_name" : "Database",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "db",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Family IDs that are associated with this entity.",
            "display_name" : "Family ID",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Families that are associated with this entity.",
            "display_name" : "Family",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "JSON blob form of the phylogenic tree.",
            "display_name" : "This should not be displayed",
            "indexed" : "false",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "phylo_graph",
            "property" : []
         }
      ],
      "fields_hash" : {
         "isa_partof_closure_label" : {
            "transform" : [],
            "description" : "Closure of labels over isa and partof.",
            "display_name" : "Is-a/Part-of closure (labels)",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure_label",
            "property" : []
         },
         "family_tag" : {
            "transform" : [],
            "description" : "Family IDs that are associated with this entity.",
            "display_name" : "Family ID",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag",
            "property" : []
         },
         "db" : {
            "transform" : [],
            "description" : "Column 1: Identifier database.",
            "display_name" : "Database",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "db",
            "property" : []
         },
         "bioentity_label" : {
            "transform" : [],
            "description" : "Symbol or name.",
            "display_name" : "Label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_label",
            "property" : []
         },
         "taxon_closure_label" : {
            "transform" : [],
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon closure (labels)",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure_label",
            "property" : []
         },
         "taxon" : {
            "transform" : [],
            "description" : "Column 13: taxon.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon",
            "property" : []
         },
         "bioentity" : {
            "transform" : [],
            "description" : "Bioentity ID.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity",
            "property" : []
         },
         "isa_partof_closure" : {
            "transform" : [],
            "description" : "Closure of ids/accs over isa and partof.",
            "display_name" : "Is-a/Part-of closure",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure",
            "property" : []
         },
         "phylo_graph" : {
            "transform" : [],
            "description" : "JSON blob form of the phylogenic tree.",
            "display_name" : "This should not be displayed",
            "indexed" : "false",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "phylo_graph",
            "property" : []
         },
         "taxon_label" : {
            "transform" : [],
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon_label",
            "property" : []
         },
         "family_tag_label" : {
            "transform" : [],
            "description" : "Families that are associated with this entity.",
            "display_name" : "Family",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag_label",
            "property" : []
         },
         "id" : {
            "transform" : [],
            "description" : "Bioentity ID.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "id",
            "property" : []
         },
         "type" : {
            "transform" : [],
            "description" : "Column 12: type class id.",
            "display_name" : "Type class id",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "type",
            "property" : []
         },
         "taxon_closure" : {
            "transform" : [],
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon closure",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure",
            "property" : []
         }
      },
      "document_category" : "bioentity",
      "weight" : "30",
      "_strict" : 0,
      "id" : "bbop_bio",
      "_outfile" : "/home/bbop/local/src/svn/geneontology/AmiGO/trunk/metadata//bio-config.yaml"
   },
   "bbop_ann_ev_agg" : {
      "searchable_extension" : "_searchable",
      "result_weights" : "bioentity^4.0 annotation_class^3.0 taxon^2.0",
      "filter_weights" : "evidence_type_closure^4.0 evidence_with^3.0 taxon_closure_label^2.0",
      "_infile" : "/home/bbop/local/src/svn/geneontology/AmiGO/trunk/metadata//ann_ev_agg-config.yaml",
      "display_name" : "Evidence Aggregate",
      "description" : "A description of annotation evidence aggregate for GOlr and AmiGO.",
      "boost_weights" : "annotation_class^2.0 annotation_class_label^1.0 bioentity^2.0 bioentity_label^1.0 family_tag^1.0 family_tag_label^1.0",
      "fields" : [
         {
            "transform" : [],
            "description" : "Bioentity id.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "id",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 1 + columns 2.",
            "display_name" : "Bioentity ID",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 3.",
            "display_name" : "Bioentity label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 5.",
            "display_name" : "Annotation class",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 5 + ontology.",
            "display_name" : "Annotation class label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "All evidence for this term/gene product pair",
            "display_name" : "Evidence closure",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "evidence_type_closure",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "All column 8s for this term/gene product pair",
            "display_name" : "Evidence with",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "evidence_with",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 13: taxon.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon closure",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon closure (labels)",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Family IDs that are associated with this entity.",
            "display_name" : "Family ID",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Families that are associated with this entity.",
            "display_name" : "Family",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag_label",
            "property" : []
         }
      ],
      "fields_hash" : {
         "family_tag" : {
            "transform" : [],
            "description" : "Family IDs that are associated with this entity.",
            "display_name" : "Family ID",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag",
            "property" : []
         },
         "bioentity_label" : {
            "transform" : [],
            "description" : "Column 3.",
            "display_name" : "Bioentity label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_label",
            "property" : []
         },
         "taxon_closure_label" : {
            "transform" : [],
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon closure (labels)",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure_label",
            "property" : []
         },
         "annotation_class" : {
            "transform" : [],
            "description" : "Column 5.",
            "display_name" : "Annotation class",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class",
            "property" : []
         },
         "taxon" : {
            "transform" : [],
            "description" : "Column 13: taxon.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon",
            "property" : []
         },
         "bioentity" : {
            "transform" : [],
            "description" : "Column 1 + columns 2.",
            "display_name" : "Bioentity ID",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity",
            "property" : []
         },
         "annotation_class_label" : {
            "transform" : [],
            "description" : "Column 5 + ontology.",
            "display_name" : "Annotation class label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class_label",
            "property" : []
         },
         "taxon_label" : {
            "transform" : [],
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon_label",
            "property" : []
         },
         "evidence_type_closure" : {
            "transform" : [],
            "description" : "All evidence for this term/gene product pair",
            "display_name" : "Evidence closure",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "evidence_type_closure",
            "property" : []
         },
         "family_tag_label" : {
            "transform" : [],
            "description" : "Families that are associated with this entity.",
            "display_name" : "Family",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag_label",
            "property" : []
         },
         "id" : {
            "transform" : [],
            "description" : "Bioentity id.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "id",
            "property" : []
         },
         "evidence_with" : {
            "transform" : [],
            "description" : "All column 8s for this term/gene product pair",
            "display_name" : "Evidence with",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "evidence_with",
            "property" : []
         },
         "taxon_closure" : {
            "transform" : [],
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon closure",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure",
            "property" : []
         }
      },
      "document_category" : "annotation_evidence_aggregate",
      "weight" : "10",
      "_strict" : 0,
      "id" : "bbop_ann_ev_agg",
      "_outfile" : "/home/bbop/local/src/svn/geneontology/AmiGO/trunk/metadata//ann_ev_agg-config.yaml"
   },
   "bbop_ann" : {
      "searchable_extension" : "_searchable",
      "result_weights" : "annotation_class^9.0 evidence_type^8.0 bioentity^7.0 source^4.0 taxon^3.0 evidence_with^2.0 family_tag^1.5 annotation_extension_class^1.0",
      "filter_weights" : "source^7.0 evidence_type_closure^6.0 family_tag_label^5.5 taxon_closure_label^5.0 isa_partof_closure_label^4.0 annotation_extension_class_closure_label^3.0",
      "_infile" : "/home/bbop/local/src/svn/geneontology/AmiGO/trunk/metadata//ann-config.yaml",
      "display_name" : "Annotations",
      "description" : "A description of annotations for GOlr and AmiGO.",
      "boost_weights" : "annotation_class^2.0 annotation_class_label^1.0 bioentity^2.0 bioentity_label^1.0 annotation_extension_class^2.0 annotation_extension_class_label^1.0 family_tag^1.0 family_tag_label^1.0",
      "fields" : [
         {
            "transform" : [],
            "description" : "A unique (and internal) combination of bioentity and ontology class.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "id",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 15: assigned by.",
            "display_name" : "Source",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "source",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 14: date of assignment.",
            "display_name" : "Date",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "date",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 13: taxon.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon closure",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon closure (labels)",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Closure of ids/accs over isa and partof.",
            "display_name" : "Is-a/Part-of closure",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Closure of labels over isa and partof.",
            "display_name" : "Is-a/Part-of closure (labels)",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 1 + columns 2.",
            "display_name" : "Gene Product",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 3: bioentity label.",
            "display_name" : "Bioentity label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 5.",
            "display_name" : "Annotation class",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 5 + ontology.",
            "display_name" : "Annotation class label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "???",
            "display_name" : "Evidence type",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "evidence_type",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "All evidence (evidence closure) for this annotation",
            "display_name" : "Evidence closure",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "evidence_type_closure",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Column 8: with/from.",
            "display_name" : "With",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "evidence_with",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "???",
            "display_name" : "Reference",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "reference",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "???",
            "display_name" : "Annotation extension class",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "annotation_extension_class",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "???",
            "display_name" : "Annotation extension class (labels)",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "annotation_extension_class_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "???",
            "display_name" : "Annotation extension class closure",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "annotation_extension_class_closure",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "???",
            "display_name" : "Annotation extension class closure (labels)",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "annotation_extension_class_closure_label",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Family IDs that are associated with this entity.",
            "display_name" : "Family ID",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag",
            "property" : []
         },
         {
            "transform" : [],
            "description" : "Families that are associated with this entity.",
            "display_name" : "Family",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag_label",
            "property" : []
         }
      ],
      "fields_hash" : {
         "annotation_extension_class" : {
            "transform" : [],
            "description" : "???",
            "display_name" : "Annotation extension class",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "annotation_extension_class",
            "property" : []
         },
         "source" : {
            "transform" : [],
            "description" : "Column 15: assigned by.",
            "display_name" : "Source",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "source",
            "property" : []
         },
         "annotation_extension_class_closure_label" : {
            "transform" : [],
            "description" : "???",
            "display_name" : "Annotation extension class closure (labels)",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "annotation_extension_class_closure_label",
            "property" : []
         },
         "bioentity_label" : {
            "transform" : [],
            "description" : "Column 3: bioentity label.",
            "display_name" : "Bioentity label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity_label",
            "property" : []
         },
         "taxon_closure_label" : {
            "transform" : [],
            "description" : "Labels derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon closure (labels)",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure_label",
            "property" : []
         },
         "date" : {
            "transform" : [],
            "description" : "Column 14: date of assignment.",
            "display_name" : "Date",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "date",
            "property" : []
         },
         "reference" : {
            "transform" : [],
            "description" : "???",
            "display_name" : "Reference",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "reference",
            "property" : []
         },
         "evidence_type" : {
            "transform" : [],
            "description" : "???",
            "display_name" : "Evidence type",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "evidence_type",
            "property" : []
         },
         "id" : {
            "transform" : [],
            "description" : "A unique (and internal) combination of bioentity and ontology class.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "id",
            "property" : []
         },
         "taxon_closure" : {
            "transform" : [],
            "description" : "IDs derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon closure",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "taxon_closure",
            "property" : []
         },
         "annotation_extension_class_label" : {
            "transform" : [],
            "description" : "???",
            "display_name" : "Annotation extension class (labels)",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "annotation_extension_class_label",
            "property" : []
         },
         "isa_partof_closure_label" : {
            "transform" : [],
            "description" : "Closure of labels over isa and partof.",
            "display_name" : "Is-a/Part-of closure (labels)",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure_label",
            "property" : []
         },
         "family_tag" : {
            "transform" : [],
            "description" : "Family IDs that are associated with this entity.",
            "display_name" : "Family ID",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag",
            "property" : []
         },
         "annotation_class" : {
            "transform" : [],
            "description" : "Column 5.",
            "display_name" : "Annotation class",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class",
            "property" : []
         },
         "taxon" : {
            "transform" : [],
            "description" : "Column 13: taxon.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon",
            "property" : []
         },
         "isa_partof_closure" : {
            "transform" : [],
            "description" : "Closure of ids/accs over isa and partof.",
            "display_name" : "Is-a/Part-of closure",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure",
            "property" : []
         },
         "bioentity" : {
            "transform" : [],
            "description" : "Column 1 + columns 2.",
            "display_name" : "Gene Product",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "bioentity",
            "property" : []
         },
         "taxon_label" : {
            "transform" : [],
            "description" : "Derived from C13 + ncbi_taxonomy.obo.",
            "display_name" : "Taxon",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "taxon_label",
            "property" : []
         },
         "annotation_class_label" : {
            "transform" : [],
            "description" : "Column 5 + ontology.",
            "display_name" : "Annotation class label",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class_label",
            "property" : []
         },
         "evidence_type_closure" : {
            "transform" : [],
            "description" : "All evidence (evidence closure) for this annotation",
            "display_name" : "Evidence closure",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "evidence_type_closure",
            "property" : []
         },
         "family_tag_label" : {
            "transform" : [],
            "description" : "Families that are associated with this entity.",
            "display_name" : "Family",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "family_tag_label",
            "property" : []
         },
         "evidence_with" : {
            "transform" : [],
            "description" : "Column 8: with/from.",
            "display_name" : "With",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "evidence_with",
            "property" : []
         },
         "annotation_extension_class_closure" : {
            "transform" : [],
            "description" : "???",
            "display_name" : "Annotation extension class closure",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "annotation_extension_class_closure",
            "property" : []
         }
      },
      "document_category" : "annotation",
      "weight" : "20",
      "_strict" : 0,
      "id" : "bbop_ann",
      "_outfile" : "/home/bbop/local/src/svn/geneontology/AmiGO/trunk/metadata//ann-config.yaml"
   },
   "bbop_ont" : {
      "searchable_extension" : "_searchable",
      "result_weights" : "annotation_class^8.0 description^6.0 source^4.0 synonym^3.0 alternate_id^2.0 comment^1.0",
      "filter_weights" : "source^4.0 subset^2.0 isa_partof_closure_label^1.0 is_obsolete^0.0",
      "_infile" : "/home/bbop/local/src/svn/geneontology/AmiGO/trunk/metadata//ont-config.yaml",
      "display_name" : "Ontology",
      "description" : "Test mapping of ontology class for GO.",
      "boost_weights" : "annotation_class^2.0 annotation_class_label^2.0 description^1.0 comment^0.5 synonym^1.0 alternate_id^1.0",
      "fields" : [
         {
            "transform" : [],
            "description" : "Term acc/ID.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "id",
            "property" : [
               "getIdentifier"
            ]
         },
         {
            "transform" : [],
            "description" : "Term acc/ID.",
            "display_name" : "Term ID",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class",
            "property" : [
               "getIdentifier"
            ]
         },
         {
            "transform" : [],
            "description" : "Common term name.",
            "display_name" : "Term",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class_label",
            "property" : [
               "getLabel"
            ]
         },
         {
            "transform" : [],
            "description" : "Term definition.",
            "display_name" : "Definition",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "description",
            "property" : [
               "getDef"
            ]
         },
         {
            "transform" : [],
            "description" : "Term namespace.",
            "display_name" : "Source",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "source",
            "property" : [
               "getNamespace"
            ]
         },
         {
            "transform" : [],
            "description" : "Is the term obsolete?",
            "display_name" : "Obsoletion",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "boolean",
            "id" : "is_obsolete",
            "property" : [
               "getIsObsoleteBinaryString"
            ]
         },
         {
            "transform" : [],
            "description" : "Term comment.",
            "display_name" : "Comment",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "comment",
            "property" : [
               "getComment"
            ]
         },
         {
            "transform" : [],
            "description" : "Term synonym.",
            "display_name" : "Synonym",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "synonym",
            "property" : [
               "getOBOSynonymStrings"
            ]
         },
         {
            "transform" : [],
            "description" : "Alternate term id.",
            "display_name" : "Alt ID",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "alternate_id",
            "property" : [
               "getAnnotationPropertyValues",
               "alt_id"
            ]
         },
         {
            "transform" : [],
            "description" : "Term that replaces this term.",
            "display_name" : "Replaced By",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "replaced_by",
            "property" : [
               "getAnnotationPropertyValues",
               "replaced_by"
            ]
         },
         {
            "transform" : [],
            "description" : "Others terms you might want to look at.",
            "display_name" : "Consider",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "consider",
            "property" : [
               "getAnnotationPropertyValues",
               "consider"
            ]
         },
         {
            "transform" : [],
            "description" : "Term subset.",
            "display_name" : "Subset",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "subset",
            "property" : [
               "getSubsets"
            ]
         },
         {
            "transform" : [],
            "description" : "Definition cross-reference.",
            "display_name" : "Def XRef",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "definition_xref",
            "property" : [
               "getDefXref"
            ]
         },
         {
            "transform" : [],
            "description" : "Closure of ids/accs over isa and partof.",
            "display_name" : "Is-a/Part-of closure",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure",
            "property" : [
               "getIsaPartofIDClosure"
            ]
         },
         {
            "transform" : [],
            "description" : "Closure of labels over isa and partof.",
            "display_name" : "Is-a/Part-of closure (labels)",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure_label",
            "property" : [
               "getIsaPartofLabelClosure"
            ]
         },
         {
            "transform" : [],
            "description" : "JSON blob form of the local stepwise topology graph.",
            "display_name" : "This should not be displayed",
            "indexed" : "false",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "topology_graph",
            "property" : [
               "getSegmentShuntGraphJSON"
            ]
         },
         {
            "transform" : [],
            "description" : "JSON blob form of the local relation transitivity graph.",
            "display_name" : "This should not be displayed",
            "indexed" : "false",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "transitivity_graph",
            "property" : [
               "getLineageShuntGraphJSON"
            ]
         }
      ],
      "fields_hash" : {
         "source" : {
            "transform" : [],
            "description" : "Term namespace.",
            "display_name" : "Source",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "source",
            "property" : [
               "getNamespace"
            ]
         },
         "definition_xref" : {
            "transform" : [],
            "description" : "Definition cross-reference.",
            "display_name" : "Def XRef",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "definition_xref",
            "property" : [
               "getDefXref"
            ]
         },
         "alternate_id" : {
            "transform" : [],
            "description" : "Alternate term id.",
            "display_name" : "Alt ID",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "alternate_id",
            "property" : [
               "getAnnotationPropertyValues",
               "alt_id"
            ]
         },
         "consider" : {
            "transform" : [],
            "description" : "Others terms you might want to look at.",
            "display_name" : "Consider",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "consider",
            "property" : [
               "getAnnotationPropertyValues",
               "consider"
            ]
         },
         "subset" : {
            "transform" : [],
            "description" : "Term subset.",
            "display_name" : "Subset",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "subset",
            "property" : [
               "getSubsets"
            ]
         },
         "topology_graph" : {
            "transform" : [],
            "description" : "JSON blob form of the local stepwise topology graph.",
            "display_name" : "This should not be displayed",
            "indexed" : "false",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "topology_graph",
            "property" : [
               "getSegmentShuntGraphJSON"
            ]
         },
         "id" : {
            "transform" : [],
            "description" : "Term acc/ID.",
            "display_name" : "Acc",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "id",
            "property" : [
               "getIdentifier"
            ]
         },
         "is_obsolete" : {
            "transform" : [],
            "description" : "Is the term obsolete?",
            "display_name" : "Obsoletion",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "boolean",
            "id" : "is_obsolete",
            "property" : [
               "getIsObsoleteBinaryString"
            ]
         },
         "isa_partof_closure_label" : {
            "transform" : [],
            "description" : "Closure of labels over isa and partof.",
            "display_name" : "Is-a/Part-of closure (labels)",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure_label",
            "property" : [
               "getIsaPartofLabelClosure"
            ]
         },
         "replaced_by" : {
            "transform" : [],
            "description" : "Term that replaces this term.",
            "display_name" : "Replaced By",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "replaced_by",
            "property" : [
               "getAnnotationPropertyValues",
               "replaced_by"
            ]
         },
         "annotation_class" : {
            "transform" : [],
            "description" : "Term acc/ID.",
            "display_name" : "Term ID",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class",
            "property" : [
               "getIdentifier"
            ]
         },
         "description" : {
            "transform" : [],
            "description" : "Term definition.",
            "display_name" : "Definition",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "description",
            "property" : [
               "getDef"
            ]
         },
         "transitivity_graph" : {
            "transform" : [],
            "description" : "JSON blob form of the local relation transitivity graph.",
            "display_name" : "This should not be displayed",
            "indexed" : "false",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "transitivity_graph",
            "property" : [
               "getLineageShuntGraphJSON"
            ]
         },
         "isa_partof_closure" : {
            "transform" : [],
            "description" : "Closure of ids/accs over isa and partof.",
            "display_name" : "Is-a/Part-of closure",
            "indexed" : "true",
            "searchable" : "false",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "isa_partof_closure",
            "property" : [
               "getIsaPartofIDClosure"
            ]
         },
         "synonym" : {
            "transform" : [],
            "description" : "Term synonym.",
            "display_name" : "Synonym",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "multi",
            "type" : "string",
            "id" : "synonym",
            "property" : [
               "getOBOSynonymStrings"
            ]
         },
         "comment" : {
            "transform" : [],
            "description" : "Term comment.",
            "display_name" : "Comment",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "comment",
            "property" : [
               "getComment"
            ]
         },
         "annotation_class_label" : {
            "transform" : [],
            "description" : "Common term name.",
            "display_name" : "Term",
            "indexed" : "true",
            "searchable" : "true",
            "required" : "false",
            "cardinality" : "single",
            "type" : "string",
            "id" : "annotation_class_label",
            "property" : [
               "getLabel"
            ]
         }
      },
      "document_category" : "ontology_class",
      "weight" : "40",
      "_strict" : 0,
      "id" : "bbop_ont",
      "_outfile" : "/home/bbop/local/src/svn/geneontology/AmiGO/trunk/metadata//ont-config.yaml"
   }
};
/*
 * Package: server.js
 * 
 * Namespace: amigo.data.server
 * 
 * This package was automatically created during an AmiGO 2 installation.
 * 
 * Purpose: Useful information about GO and the AmiGO installation.
 *          Also serves as a repository and getter for web
 *          resources such as images.
 * 
 * NOTE: This file is generated dynamically at installation time.
 *       Hard to work with unit tests--hope it's not too bad.
 *       Want to keep this real simple.
 */

// Module and namespace checking.
bbop.core.require('bbop', 'core');
bbop.core.namespace('amigo', 'data', 'server');

/*
 * Constructor: server
 * 
 * The configuration for the server settings.
 * Essentially a JSONification of the config.pl AmiGO 2 file.
 * 
 * Arguments:
 *  n/a
 */
amigo.data.server = function(){

    // All of the server/instance-specific meta-data.
    var meta_data = {"html_base":"http://amigo2.berkeleybop.org/amigo2","app_base":"http://amigo2.berkeleybop.org/cgi-bin/amigo2","term_regexp":"all|GO:[0-9]{7}","species":[],"ontologies":[],"gp_types":[],"sources":[],"species_map":{},"bbop_img_star":"http://amigo2.berkeleybop.org/amigo2/images/star.png","image_base":"http://amigo2.berkeleybop.org/amigo2/images","evidence_codes":{},"golr_base":"http://golr.berkeleybop.org/"};

    ///
    /// Break out the data and various functions to access them...
    ///

    /*
     * Function: html_base
     * 
     * Access to AmiGO variable html_base.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var html_base = meta_data.html_base;
    this.html_base = function(){ return html_base; };

    /*
     * Function: app_base
     * 
     * Access to AmiGO variable app_base.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var app_base = meta_data.app_base;
    this.app_base = function(){ return app_base; };

    /*
     * Function: term_regexp
     * 
     * Access to AmiGO variable term_regexp.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var term_regexp = meta_data.term_regexp;
    this.term_regexp = function(){ return term_regexp; };

    /*
     * Function: species
     * 
     * Access to AmiGO variable species.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var species = meta_data.species;
    this.species = function(){ return species; };

    /*
     * Function: ontologies
     * 
     * Access to AmiGO variable ontologies.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var ontologies = meta_data.ontologies;
    this.ontologies = function(){ return ontologies; };

    /*
     * Function: gp_types
     * 
     * Access to AmiGO variable gp_types.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var gp_types = meta_data.gp_types;
    this.gp_types = function(){ return gp_types; };

    /*
     * Function: sources
     * 
     * Access to AmiGO variable sources.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var sources = meta_data.sources;
    this.sources = function(){ return sources; };

    /*
     * Function: species_map
     * 
     * Access to AmiGO variable species_map.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var species_map = meta_data.species_map;
    this.species_map = function(){ return species_map; };

    /*
     * Function: bbop_img_star
     * 
     * Access to AmiGO variable bbop_img_star.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var bbop_img_star = meta_data.bbop_img_star;
    this.bbop_img_star = function(){ return bbop_img_star; };

    /*
     * Function: image_base
     * 
     * Access to AmiGO variable image_base.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var image_base = meta_data.image_base;
    this.image_base = function(){ return image_base; };

    /*
     * Function: evidence_codes
     * 
     * Access to AmiGO variable evidence_codes.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var evidence_codes = meta_data.evidence_codes;
    this.evidence_codes = function(){ return evidence_codes; };

    /*
     * Function: golr_base
     * 
     * Access to AmiGO variable golr_base.
     * 
     * Parameters:
     *  n/a
     * 
     * Returns:
     *  string
     */
    var golr_base = meta_data.golr_base;
    this.golr_base = function(){ return golr_base; };


    // Does it look like a term?
    var tre_str = meta_data.term_regexp;
    var tre = new RegExp(tre_str);

    /*
     * Function: term_id_p
     * 
     * True or false on whether or not a string looks like a GO term id.
     * 
     * Parameters:
     *  term_id - the string to test
     * 
     * Returns:
     *  boolean
     */
    this.term_id_p = function(term_id){
       var retval = false;
       if( tre.test(term_id) ){
          retval = true;
       }
       return retval;
    };

    /*
     * Function: get_image_resource
     * 
     * Get a named resource from the meta_data hash if possible.
     * 
     * Parameters:
     *  resource - the string id of the resource
     * 
     * Returns:
     * string (url) of resource
     */
    this.get_image_resource = function(resource){

       var retval = null;
       var mangled_res = 'bbop_img_' + resource;

       if( meta_data[mangled_res] ){
          retval = meta_data[mangled_res];
       }
       return retval;
    };
};
/* 
 * Package: xrefs.js
 * 
 * Namespace: amigo.data.xrefs
 * 
 * This package was automatically created during an AmiGO 2 installation
 * from the GO.xrf_abbs file at: "http://www.geneontology.org/doc/GO.xrf_abbs".
 *
 * NOTE: This file is generated dynamically at installation time.
 * Hard to work with unit tests--hope it's not too bad. You have to
 * occasionally copy back to keep the unit tests sane.
 */

// All of the server/instance-specific meta-data.
bbop.core.require('bbop', 'core');
bbop.core.namespace('amigo', 'data', 'xrefs');

/*
 * Variable: xrefs
 * 
 * All the external references that we know about.
 */
amigo.data.xrefs = {
   "bhf-ucl" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "description" : "The Cardiovascular Gene Ontology Annotation Initiative is supported by the British Heart Foundation (BHF) and located at University College London (UCL).",
      "database" : "Cardiovascular Gene Ontology Annotation Initiative",
      "generic_url" : "http://www.ucl.ac.uk/cardiovasculargeneontology/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "BHF-UCL",
      "url_syntax" : null,
      "datatype" : null
   },
   "pir" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://pir.georgetown.edu/cgi-bin/pirwww/nbrfget?uid=I49499",
      "database" : "Protein Information Resource",
      "local_id_syntax" : "^[A-Z]{1}[0-9]{5}$",
      "example_id" : "PIR:I49499",
      "generic_url" : "http://pir.georgetown.edu/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PIR",
      "url_syntax" : "http://pir.georgetown.edu/cgi-bin/pirwww/nbrfget?uid=[example_id]",
      "datatype" : null
   },
   "ncbi_nm" : {
      "object" : "mRNA identifier",
      "replaced_by" : "RefSeq",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "NCBI RefSeq",
      "example_id" : "NCBI_NM:123456",
      "synonym" : "RefSeq",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "NCBI_NM",
      "is_obsolete" : "true",
      "url_syntax" : null,
      "datatype" : null
   },
   "pirsf" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://pir.georgetown.edu/cgi-bin/ipcSF?id=SF002327",
      "database" : "PIR Superfamily Classification System",
      "example_id" : "PIRSF:SF002327",
      "generic_url" : "http://pir.georgetown.edu/pirsf/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PIRSF",
      "url_syntax" : "http://pir.georgetown.edu/cgi-bin/ipcSF?id=[example_id]",
      "datatype" : null
   },
   "cas" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "description" : "CAS REGISTRY is the most authoritative collection of disclosed chemical substance information, containing more than 54 million organic and inorganic substances and 62 million sequences. CAS REGISTRY covers substances identified from the scientific literature from 1957 to the present, with additional substances going back to the early 1900s.",
      "database" : "CAS Chemical Registry",
      "example_id" : "CAS:58-08-2",
      "generic_url" : "http://www.cas.org/expertise/cascontent/registry/index.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "CAS",
      "url_syntax" : null,
      "datatype" : null
   },
   "hgnc" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.genenames.org/data/hgnc_data.php?hgnc_id=HGNC:29",
      "database" : "HUGO Gene Nomenclature Committee",
      "example_id" : "HGNC:29",
      "generic_url" : "http://www.genenames.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "HGNC",
      "url_syntax" : "http://www.genenames.org/data/hgnc_data.php?hgnc_id=HGNC:[example_id]",
      "datatype" : null
   },
   "patric" : {
      "object" : "Feature identifieer",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://patric.vbi.vt.edu/gene/overview.php?fid=cds.000002.436951",
      "description" : "PathoSystems Resource Integration Center at the Virginia Bioinformatics Institute",
      "database" : "PathoSystems Resource Integration Center",
      "example_id" : "PATRIC:cds.000002.436951",
      "generic_url" : "http://patric.vbi.vt.edu",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PATRIC",
      "url_syntax" : "http://patric.vbi.vt.edu/gene/overview.php?fid=[example_id]",
      "datatype" : null
   },
   "ro" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://purl.obolibrary.org/obo/RO_0002211",
      "description" : "A collection of relations used across OBO ontologies",
      "database" : "OBO Relation Ontology Ontology",
      "example_id" : "RO:0002211",
      "generic_url" : "http://purl.obolibrary.org/obo/ro",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "RO",
      "url_syntax" : "http://purl.obolibrary.org/obo/RO_[example_id]",
      "datatype" : null
   },
   "maizegdb_locus" : {
      "object" : "Maize gene name",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.maizegdb.org/cgi-bin/displaylocusresults.cgi?term=ZmPK1",
      "database" : "MaizeGDB",
      "local_id_syntax" : "^[A-Za-z][A-Za-z0-9]*$",
      "example_id" : "MaizeGDB_Locus:ZmPK1",
      "generic_url" : "http://www.maizegdb.org",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "MaizeGDB_Locus",
      "url_syntax" : "http://www.maizegdb.org/cgi-bin/displaylocusresults.cgi?term=[example_id]",
      "datatype" : null
   },
   "rgd" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=2004",
      "database" : "Rat Genome Database",
      "local_id_syntax" : "^[0-9]{4,7}$",
      "example_id" : "RGD:2004",
      "synonym" : "RGDID",
      "generic_url" : "http://rgd.mcw.edu/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "RGD",
      "url_syntax" : "http://rgd.mcw.edu/generalSearch/RgdSearch.jsp?quickSearch=1&searchKeyword=[example_id]",
      "datatype" : null
   },
   "ncbi_gi" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=113194944",
      "database" : "NCBI databases",
      "local_id_syntax" : "^[0-9]{6,}$",
      "example_id" : "NCBI_gi:113194944",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "NCBI_gi",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]",
      "datatype" : null
   },
   "geo" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/GDSbrowser?acc=GDS2223",
      "database" : "NCBI Gene Expression Omnibus",
      "example_id" : "GDS2223",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/geo/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GEO",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/GDSbrowser?acc=[example_id]",
      "datatype" : null
   },
   "agricola_ind" : {
      "object" : "AGRICOLA IND number",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "AGRICultural OnLine Access",
      "example_id" : "AGRICOLA_IND:IND23252955",
      "generic_url" : "http://agricola.nal.usda.gov/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "AGRICOLA_IND",
      "url_syntax" : null,
      "datatype" : null
   },
   "tc" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.tcdb.org/tcdb/index.php?tc=9.A.4.1.1",
      "database" : "Transport Protein Database",
      "example_id" : "TC:9.A.4.1.1",
      "generic_url" : "http://www.tcdb.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "TC",
      "url_syntax" : "http://www.tcdb.org/tcdb/index.php?tc=[example_id]",
      "datatype" : null
   },
   "asap" : {
      "object" : "Feature identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "https://asap.ahabs.wisc.edu/annotation/php/feature_info.php?FeatureID=ABE-0000008",
      "database" : "A Systematic Annotation Package for Community Analysis of Genomes",
      "example_id" : "ASAP:ABE-0000008",
      "generic_url" : "https://asap.ahabs.wisc.edu/annotation/php/ASAP1.htm",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "ASAP",
      "url_syntax" : "https://asap.ahabs.wisc.edu/annotation/php/feature_info.php?FeatureID=[example_id]",
      "datatype" : null
   },
   "biocyc" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://biocyc.org/META/NEW-IMAGE?type=PATHWAY&object=PWY-5271",
      "database" : "BioCyc collection of metabolic pathway databases",
      "example_id" : "BioCyc:PWY-5271",
      "generic_url" : "http://biocyc.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "BioCyc",
      "url_syntax" : "http://biocyc.org/META/NEW-IMAGE?type=PATHWAY&object=[example_id]",
      "datatype" : null
   },
   "uberon" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://purl.obolibrary.org/obo/UBERON_0002398",
      "description" : "A multi-species anatomy ontology",
      "database" : "Uber-anatomy ontology",
      "local_id_syntax" : "^[0-9]{7}$",
      "example_id" : "URBERON:0002398",
      "generic_url" : "http://uberon.org",
      "entity_type" : "UBERON:0001062 ! anatomical entity",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "UBERON",
      "url_syntax" : "http://purl.obolibrary.org/obo/UBERON_[example_id]",
      "datatype" : null
   },
   "seed" : {
      "object" : "identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.theseed.org/linkin.cgi?id=fig|83331.1.peg.1",
      "description" : "Project to annotate the first 1000 sequenced genomes, develop detailed metabolic reconstructions, and construct the corresponding stoichiometric matrices",
      "database" : "The SEED;",
      "example_id" : "SEED:fig|83331.1.peg.1",
      "generic_url" : "http://www.theseed.org",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "SEED",
      "url_syntax" : "http://www.theseed.org/linkin.cgi?id=[example_id]",
      "datatype" : null
   },
   "jcvi_ref" : {
      "object" : "Reference locator",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://cmr.jcvi.org/CMR/AnnotationSops.shtml",
      "database" : "J. Craig Venter Institute",
      "example_id" : "JCVI_REF:GO_ref",
      "synonym" : "TIGR_REF",
      "generic_url" : "http://cmr.jcvi.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "JCVI_REF",
      "url_syntax" : null,
      "datatype" : null
   },
   "locsvmpsi" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "description" : "Subcellular localization for eukayotic proteins based on SVM and PSI-BLAST",
      "database" : "LOCSVMPSI",
      "generic_url" : "http://bioinformatics.ustc.edu.cn/locsvmpsi/locsvmpsi.php",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "LOCSVMpsi",
      "url_syntax" : null,
      "datatype" : null
   },
   "chebi" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:17234",
      "database" : "Chemical Entities of Biological Interest",
      "local_id_syntax" : "^[0-9]{1,6}$",
      "example_id" : "CHEBI:17234",
      "synonym" : "ChEBI",
      "generic_url" : "http://www.ebi.ac.uk/chebi/",
      "entity_type" : "CHEBI:24431 ! chemical entity ",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "CHEBI",
      "url_syntax" : "http://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:[example_id]",
      "datatype" : null
   },
   "ensembl" : {
      "object" : "Identifier (unspecified)",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ensembl.org/id/ENSP00000265949",
      "database" : "Ensembl database of automatically annotated genomic data",
      "local_id_syntax" : "^ENS[A-Z0-9]{10,17}$",
      "example_id" : "ENSEMBL:ENSP00000265949",
      "generic_url" : "http://www.ensembl.org/",
      "entity_type" : "SO:0000673 ! transcript",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "ENSEMBL",
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "datatype" : null
   },
   "casspc" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Catalog of Fishes species database",
      "synonym" : "CAS_SPC",
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "CASSPC",
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Species&id=1979",
      "datatype" : null
   },
   "pinc" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "description" : "represents GO annotations created in 2001 for NCBI and extracted into UniProtKB-GOA from EntrezGene",
      "database" : "Proteome Inc.",
      "generic_url" : "http://www.proteome.com/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PINC",
      "url_syntax" : null,
      "datatype" : null
   },
   "uniprotkb-subcell" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.uniprot.org/locations/SL-0012",
      "database" : "UniProt Knowledgebase Subcellular Location vocabulary",
      "example_id" : "UniProtKB-SubCell:SL-0012",
      "synonym" : "SP_SL",
      "generic_url" : "http://www.uniprot.org/locations/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "UniProtKB-SubCell",
      "url_syntax" : "http://www.uniprot.org/locations/[example_id]",
      "datatype" : null
   },
   "yeastfunc" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Yeast Function",
      "generic_url" : "http://func.med.harvard.edu/yeast/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "YeastFunc",
      "url_syntax" : null,
      "datatype" : null
   },
   "jcvi_pfa1" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Plasmodium falciparum database at the J. Craig Venter Institute",
      "example_id" : "JCVI_Pfa1:PFB0010w",
      "synonym" : "TIGR_Pfa1",
      "generic_url" : "http://www.tigr.org/tdb/e2k1/pfa1/pfa1.shtml",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "JCVI_Pfa1",
      "is_obsolete" : "true",
      "url_syntax" : null,
      "datatype" : null
   },
   "prosite" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.expasy.ch/cgi-bin/prosite-search-ac?PS00365",
      "database" : "Prosite database of protein families and domains",
      "example_id" : "Prosite:PS00365",
      "generic_url" : "http://www.expasy.ch/prosite/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "Prosite",
      "url_syntax" : "http://www.expasy.ch/cgi-bin/prosite-search-ac?[example_id]",
      "datatype" : null
   },
   "pfamb" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Pfam-B supplement to Pfam",
      "example_id" : "PfamB:PB014624",
      "generic_url" : "http://www.sanger.ac.uk/Software/Pfam/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PfamB",
      "url_syntax" : null,
      "datatype" : null
   },
   "img" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://img.jgi.doe.gov/cgi-bin/pub/main.cgi?section=GeneDetail&page=geneDetail&gene_oid=640008772",
      "database" : "Integrated Microbial Genomes; JGI web site for genome annotation",
      "example_id" : "IMG:640008772",
      "generic_url" : "http://img.jgi.doe.gov",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "IMG",
      "url_syntax" : "http://img.jgi.doe.gov/cgi-bin/pub/main.cgi?section=GeneDetail&page=geneDetail&gene_oid=[example_id]",
      "datatype" : null
   },
   "cgen" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Compugen Gene Ontology Gene Association Data",
      "example_id" : "CGEN:PrID131022",
      "generic_url" : "http://www.cgen.com/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "CGEN",
      "url_syntax" : null,
      "datatype" : null
   },
   "gene3d" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://gene3d.biochem.ucl.ac.uk/superfamily/?accession=G3DSA%3A3.30.390.30",
      "database" : "Domain Architecture Classification",
      "example_id" : "Gene3D:G3DSA:3.30.390.30",
      "generic_url" : "http://gene3d.biochem.ucl.ac.uk/Gene3D/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "Gene3D",
      "url_syntax" : "http://gene3d.biochem.ucl.ac.uk/superfamily/?accession=[example_id]",
      "datatype" : null
   },
   "ma" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.informatics.jax.org/searches/AMA.cgi?id=MA:0000003",
      "description" : "Adult Mouse Anatomical Dictionary; part of Gene Expression Database",
      "database" : "Adult Mouse Anatomical Dictionary",
      "example_id" : "MA:0000003",
      "generic_url" : "http://www.informatics.jax.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "MA",
      "url_syntax" : "http://www.informatics.jax.org/searches/AMA.cgi?id=MA:[example_id]",
      "datatype" : null
   },
   "refseq" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=XP_001068954",
      "database" : "RefSeq",
      "local_id_syntax" : "^(NC|AC|NG|NT|NW|NZ|NM|NR|XM|XR|NP|AP|XP|ZP)_\\d+$",
      "example_id" : "RefSeq:XP_001068954",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/RefSeq/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "RefSeq",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]",
      "datatype" : null
   },
   "prints" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.bioinf.manchester.ac.uk/cgi-bin/dbbrowser/sprint/searchprintss.cgi?display_opts=Prints&category=None&queryform=false&regexpr=off&prints_accn=PR00025",
      "database" : "PRINTS compendium of protein fingerprints",
      "example_id" : "PRINTS:PR00025",
      "generic_url" : "http://www.bioinf.manchester.ac.uk/dbbrowser/PRINTS/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PRINTS",
      "url_syntax" : "http://www.bioinf.manchester.ac.uk/cgi-bin/dbbrowser/sprint/searchprintss.cgi?display_opts=Prints&category=None&queryform=false&regexpr=off&prints_accn=[example_id]",
      "datatype" : null
   },
   "ddbj" : {
      "object" : "Sequence accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://arsa.ddbj.nig.ac.jp/arsa/ddbjSplSearch?KeyWord=AA816246",
      "database" : "DNA Databank of Japan",
      "example_id" : "DDBJ:AA816246",
      "generic_url" : "http://www.ddbj.nig.ac.jp/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "DDBJ",
      "url_syntax" : "http://arsa.ddbj.nig.ac.jp/arsa/ddbjSplSearch?KeyWord=[example_id]",
      "datatype" : null
   },
   "rebase" : {
      "object" : "Restriction enzyme name",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://rebase.neb.com/rebase/enz/EcoRI.html",
      "database" : "REBASE restriction enzyme database",
      "example_id" : "REBASE:EcoRI",
      "generic_url" : "http://rebase.neb.com/rebase/rebase.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "REBASE",
      "url_syntax" : "http://rebase.neb.com/rebase/enz/[example_id].html",
      "datatype" : null
   },
   "cdd" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/Structure/cdd/cddsrv.cgi?uid=34222",
      "database" : "Conserved Domain Database at NCBI",
      "example_id" : "CDD:34222",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=cdd",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "CDD",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/Structure/cdd/cddsrv.cgi?uid=[example_id]",
      "datatype" : null
   },
   "biosis" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "BIOSIS previews",
      "example_id" : "BIOSIS:200200247281",
      "generic_url" : "http://www.biosis.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "BIOSIS",
      "url_syntax" : null,
      "datatype" : null
   },
   "cazy" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.cazy.org/PL11.html",
      "description" : "The CAZy database describes the families of structurally-related catalytic and carbohydrate-binding modules (or functional domains) of enzymes that degrade, modify, or create glycosidic bonds.",
      "database" : "Carbohydrate Active EnZYmes",
      "local_id_syntax" : "^(CE|GH|GT|PL)\\d+$",
      "example_id" : "CAZY:PL11",
      "generic_url" : "http://www.cazy.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "CAZY",
      "url_syntax" : "http://www.cazy.org/[example_id].html",
      "datatype" : null
   },
   "ncbi_np" : {
      "object" : "Protein identifier",
      "replaced_by" : "RefSeq",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "NCBI RefSeq",
      "example_id" : "NCBI_NP:123456",
      "synonym" : "RefSeq",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "NCBI_NP",
      "is_obsolete" : "true",
      "url_syntax" : null,
      "datatype" : null
   },
   "smd" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Stanford Microarray Database",
      "generic_url" : "http://genome-www.stanford.edu/microarray",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "SMD",
      "url_syntax" : null,
      "datatype" : null
   },
   "iuphar_receptor" : {
      "object" : "Receptor identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.iuphar-db.org/DATABASE/ObjectDisplayForward?objectId=56",
      "database" : "International Union of Pharmacology",
      "example_id" : "IUPHAR_RECEPTOR:2205",
      "generic_url" : "http://www.iuphar.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "IUPHAR_RECEPTOR",
      "url_syntax" : "http://www.iuphar-db.org/DATABASE/ObjectDisplayForward?objectId=[example_id]",
      "datatype" : null
   },
   "vega" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://vega.sanger.ac.uk/perl/searchview?species=all&idx=All&q=OTTHUMP00000000661",
      "database" : "Vertebrate Genome Annotation database",
      "example_id" : "VEGA:OTTHUMP00000000661",
      "generic_url" : "http://vega.sanger.ac.uk/index.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "VEGA",
      "url_syntax" : "http://vega.sanger.ac.uk/perl/searchview?species=all&idx=All&q=[example_id]",
      "datatype" : null
   },
   "gr_ref" : {
      "object" : "Reference",
      "database: Gramene" : "A Comparative Mapping Resource for Grains",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.gramene.org/db/literature/pub_search?ref_id=659",
      "example_id" : "GR_REF:659",
      "generic_url" : "http://www.gramene.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GR_REF",
      "url_syntax" : "http://www.gramene.org/db/literature/pub_search?ref_id=[example_id]",
      "datatype" : null
   },
   "imgt_ligm" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "description" : "Database of immunoglobulins and T cell receptors from human and other vertebrates, with translation for fully annotated sequences.",
      "database" : "ImMunoGeneTics database covering immunoglobulins and T-cell receptors",
      "example_id" : "IMGT_LIGM:U03895",
      "generic_url" : "http://imgt.cines.fr",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "IMGT_LIGM",
      "url_syntax" : null,
      "datatype" : null
   },
   "enzyme" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.expasy.ch/cgi-bin/nicezyme.pl?1.1.1.1",
      "database" : "Swiss Institute of Bioinformatics enzyme database",
      "example_id" : "ENZYME:EC 1.1.1.1",
      "generic_url" : "http://www.expasy.ch/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "ENZYME",
      "url_syntax" : "http://www.expasy.ch/cgi-bin/nicezyme.pl?[example_id]",
      "datatype" : null
   },
   "um-bbd" : {
      "object" : "Prefix",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "UM-BBD",
      "url_syntax" : null,
      "datatype" : null
   },
   "corum" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://mips.gsf.de/genre/proj/corum/complexdetails.html?id=837",
      "database" : "CORUM - the Comprehensive Resource of Mammalian protein complexes",
      "example_id" : "CORUM:837",
      "generic_url" : "http://mips.gsf.de/genre/proj/corum/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "CORUM",
      "url_syntax" : "http://mips.gsf.de/genre/proj/corum/complexdetails.html?id=[example_id]",
      "datatype" : null
   },
   "pfam" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.sanger.ac.uk/cgi-bin/Pfam/getacc?PF00046",
      "description" : "Pfam is a collection of protein families represented by sequence alignments and hidden Markov models (HMMs)",
      "database" : "Pfam database of protein families",
      "example_id" : "Pfam:PF00046",
      "generic_url" : "http://www.sanger.ac.uk/Software/Pfam/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "Pfam",
      "url_syntax" : "http://www.sanger.ac.uk/cgi-bin/Pfam/getacc?[example_id]",
      "datatype" : null
   },
   "um-bbd_enzymeid" : {
      "object" : "Enzyme identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=ep&enzymeID=e0230",
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "example_id" : "UM-BBD_enzymeID:e0413",
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "UM-BBD_enzymeID",
      "url_syntax" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=ep&enzymeID=[example_id]",
      "datatype" : null
   },
   "gr_gene" : {
      "object" : "Gene identifier",
      "database: Gramene" : "A Comparative Mapping Resource for Grains",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.gramene.org/db/genes/search_gene?acc=GR:0060198",
      "example_id" : "GR_GENE:GR:0060198",
      "synonym" : "GR_gene",
      "generic_url" : "http://www.gramene.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GR_GENE",
      "url_syntax" : "http://www.gramene.org/db/genes/search_gene?acc=[example_id]",
      "datatype" : null
   },
   "genedb_spombe" : {
      "object" : "Gene identifier",
      "shorthand_name" : "Spombe",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://old.genedb.org/genedb/Search?organism=pombe&name=SPAC890.04C",
      "database" : "Schizosaccharomyces pombe GeneDB",
      "local_id_syntax" : "^SP[A-Z0-9]+\\.[A-Za-z0-9]+$",
      "example_id" : "GeneDB_Spombe:SPAC890.04C",
      "generic_url" : "http://old.genedb.org/genedb/pombe/index.jsp",
      "entity_type" : "SO:0000704 ! gene ",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GeneDB_Spombe",
      "url_syntax" : "http://old.genedb.org/genedb/Search?organism=pombe&name=[example_id]",
      "datatype" : null
   },
   "poc" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Plant Ontology Consortium",
      "generic_url" : "http://www.plantontology.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "POC",
      "url_syntax" : null,
      "datatype" : null
   },
   "jcvi_tigrfams" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://search.jcvi.org/search?p&q=TIGR00254",
      "database" : "TIGRFAMs HMM collection at the J. Craig Venter Institute",
      "example_id" : "JCVI_TIGRFAMS:TIGR00254",
      "synonym" : "TIGR_TIGRFAMS",
      "generic_url" : "http://search.jcvi.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "JCVI_TIGRFAMS",
      "url_syntax" : "http://search.jcvi.org/search?p&q=[example_id]",
      "datatype" : null
   },
   "panther" : {
      "object" : "Protein family tree identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://pantree.org/node/annotationNode.jsp?id=PTN000000084",
      "database" : "Protein ANalysis THrough Evolutionary Relationships",
      "example_id" : "PANTHER:PTN000000084",
      "generic_url" : "http://www.pantherdb.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PANTHER",
      "url_syntax" : "http://pantree.org/node/annotationNode.jsp?id=[example_id]",
      "datatype" : null
   },
   "jcvi_tba1" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Trypanosoma brucei database at the J. Craig Venter Institute",
      "example_id" : "JCVI_Tba1:25N14.10",
      "synonym" : "TIGR_Tba1",
      "generic_url" : "http://www.tigr.org/tdb/e2k1/tba1/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "JCVI_Tba1",
      "is_obsolete" : "true",
      "url_syntax" : null,
      "datatype" : null
   },
   "go" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://amigo.geneontology.org/cgi-bin/amigo/term-details.cgi?term=GO:0004352",
      "database" : "Gene Ontology Database",
      "local_id_syntax" : "^\\d{7}$",
      "example_id" : "GO:0004352",
      "generic_url" : "http://amigo.geneontology.org/",
      "entity_type" : "GO:0005575 ! cellular component",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GO",
      "url_syntax" : "http://amigo.geneontology.org/cgi-bin/amigo/term-details.cgi?term=GO:[example_id]",
      "datatype" : null
   },
   "aspgd_ref" : {
      "object" : "Literature Reference Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/reference/reference.pl?dbid=90",
      "database" : "Aspergillus Genome Database",
      "example_id" : "AspGD_REF:90",
      "generic_url" : "http://www.aspergillusgenome.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "AspGD_REF",
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/reference/reference.pl?dbid=[example_id]",
      "datatype" : null
   },
   "sanger" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Wellcome Trust Sanger Institute",
      "generic_url" : "http://www.sanger.ac.uk/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "Sanger",
      "url_syntax" : null,
      "datatype" : null
   },
   "genedb_lmajor" : {
      "object" : "Gene identifier",
      "shorthand_name" : "Lmajor",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.genedb.org/genedb/Search?organism=leish&name=LM5.32",
      "database" : "Leishmania major GeneDB",
      "local_id_syntax" : "^LmjF\\.\\d+\\.\\d+$",
      "example_id" : "GeneDB_Lmajor:LM5.32",
      "generic_url" : "http://www.genedb.org/genedb/leish/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GeneDB_Lmajor",
      "url_syntax" : "http://www.genedb.org/genedb/Search?organism=leish&name=[example_id]",
      "datatype" : null
   },
   "fma" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Foundational Model of Anatomy",
      "example_id" : "FMA:61905",
      "generic_url" : "http://sig.biostr.washington.edu/projects/fm/index.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "FMA",
      "url_syntax" : null,
      "datatype" : null
   },
   "pubchem_compound" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pccompound&term=2244",
      "database" : "NCBI PubChem database of chemical structures",
      "local_id_syntax" : "^[0-9]+$",
      "example_id" : "PubChem_Compound:2244",
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PubChem_Compound",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pccompound&term=[example_id]",
      "datatype" : null
   },
   "mitre" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "The MITRE Corporation",
      "generic_url" : "http://www.mitre.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "MITRE",
      "url_syntax" : null,
      "datatype" : null
   },
   "phenoscape" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "PhenoScape Knowledgebase",
      "generic_url" : "http://phenoscape.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PhenoScape",
      "url_syntax" : null,
      "datatype" : null
   },
   "ecocyc_ref" : {
      "object" : "Reference identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://biocyc.org/ECOLI/reference.html?type=CITATION-FRAME&object=COLISALII",
      "database" : "Encyclopedia of E. coli metabolism",
      "example_id" : "EcoCyc_REF:COLISALII",
      "synonym" : "ECOCYC_REF",
      "generic_url" : "http://ecocyc.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "EcoCyc_REF",
      "url_syntax" : "http://biocyc.org/ECOLI/reference.html?type=CITATION-FRAME&object=[example_id]",
      "datatype" : null
   },
   "metacyc" : {
      "object" : "Identifier (pathway or reaction)",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://biocyc.org/META/NEW-IMAGE?type=NIL&object=GLUTDEG-PWY",
      "database" : "Metabolic Encyclopedia of metabolic and other pathways",
      "example_id" : "MetaCyc:GLUTDEG-PWY",
      "generic_url" : "http://metacyc.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "MetaCyc",
      "url_syntax" : "http://biocyc.org/META/NEW-IMAGE?type=NIL&object=[example_id]",
      "datatype" : null
   },
   "omssa" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Open Mass Spectrometry Search Algorithm",
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/omssa/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "OMSSA",
      "url_syntax" : null,
      "datatype" : null
   },
   "h-invdb_cdna" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.h-invitational.jp/hinv/spsoup/transcript_view?acc_id=AK093149",
      "database" : "H-invitational Database",
      "example_id" : "H-invDB_cDNA:AK093148",
      "generic_url" : "http://www.h-invitational.jp/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "H-invDB_cDNA",
      "url_syntax" : "http://www.h-invitational.jp/hinv/spsoup/transcript_view?acc_id=[example_id]",
      "datatype" : null
   },
   "prodom" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://prodom.prabi.fr/prodom/current/cgi-bin/request.pl?question=DBEN&query=PD000001",
      "description" : "ProDom protein domain families automatically generated from UniProtKB",
      "database" : "ProDom protein domain families",
      "example_id" : "ProDom:PD000001",
      "generic_url" : "http://prodom.prabi.fr/prodom/current/html/home.php",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "ProDom",
      "url_syntax" : "http://prodom.prabi.fr/prodom/current/cgi-bin/request.pl?question=DBEN&query=[example_id]",
      "datatype" : null
   },
   "aspgd_locus" : {
      "object" : "Gene name (gene symbol in mammalian nomenclature)",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?locus=AN10942",
      "database" : "Aspergillus Genome Database",
      "example_id" : "AspGD_LOCUS:AN10942",
      "generic_url" : "http://www.aspergillusgenome.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "AspGD_LOCUS",
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?locus=[example_id]",
      "datatype" : null
   },
   "obo_rel" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "OBO relation ontology",
      "example_id" : "OBO_REL:part_of",
      "generic_url" : "http://www.obofoundry.org/ro/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "OBO_REL",
      "url_syntax" : null,
      "datatype" : null
   },
   "dictybase_ref" : {
      "object" : "Literature Reference Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://dictybase.org/db/cgi-bin/dictyBase/reference/reference.pl?refNo=10157",
      "database" : "dictyBase literature references",
      "example_id" : "dictyBase_REF:10157",
      "synonym" : "DDB_REF",
      "generic_url" : "http://dictybase.org",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "dictyBase_REF",
      "url_syntax" : "http://dictybase.org/db/cgi-bin/dictyBase/reference/reference.pl?refNo=[example_id]",
      "datatype" : null
   },
   "refseq_prot" : {
      "object" : "Identifier",
      "replaced_by" : "RefSeq",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=YP_498627",
      "database" : "RefSeq (Protein)",
      "example_id" : "RefSeq_Prot:YP_498627",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/RefSeq/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "RefSeq_Prot",
      "is_obsolete" : "true",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]",
      "datatype" : null
   },
   "uniprotkb-kw" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.uniprot.org/keywords/KW-0812",
      "database" : "UniProt Knowledgebase keywords",
      "example_id" : "UniProtKB-KW:KW-0812",
      "synonym" : "SP_KW",
      "generic_url" : "http://www.uniprot.org/keywords/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "UniProtKB-KW",
      "url_syntax" : "http://www.uniprot.org/keywords/[example_id]",
      "datatype" : null
   },
   "germonline" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "GermOnline",
      "generic_url" : "http://www.germonline.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GermOnline",
      "url_syntax" : null,
      "datatype" : null
   },
   "mengo" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Microbial ENergy processes Gene Ontology Project",
      "generic_url" : "http://mengo.vbi.vt.edu/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "MENGO",
      "url_syntax" : null,
      "datatype" : null
   },
   "medline" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Medline literature database",
      "example_id" : "MEDLINE:20572430",
      "generic_url" : "http://www.nlm.nih.gov/databases/databases_medline.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "MEDLINE",
      "url_syntax" : null,
      "datatype" : null
   },
   "po_ref" : {
      "object" : "Reference identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://wiki.plantontology.org:8080/index.php/PO_REF:00001",
      "database" : "Plant Ontology custom references",
      "example_id" : "PO_REF:00001",
      "generic_url" : "http://wiki.plantontology.org:8080/index.php/PO_references",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PO_REF",
      "url_syntax" : "http://wiki.plantontology.org:8080/index.php/PO_REF:[example_id]",
      "datatype" : null
   },
   "broad_mgg" : {
      "object" : "Locus",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.broad.mit.edu/annotation/genome/magnaporthe_grisea/GeneLocus.html?sp=SMGG_05132",
      "description" : "Magnaporthe grisea Database at the Broad Institute",
      "database" : "Magnaporthe grisea Database",
      "example_id" : "Broad_MGG:MGG_05132.5",
      "generic_url" : "http://www.broad.mit.edu/annotation/genome/magnaporthe_grisea/Home.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "Broad_MGG",
      "url_syntax" : "http://www.broad.mit.edu/annotation/genome/magnaporthe_grisea/GeneLocus.html?sp=S[example_id]",
      "datatype" : null
   },
   "eurofung" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Eurofungbase community annotation",
      "generic_url" : "http://www.eurofung.net/option=com_content&task=section&id=3&Itemid=4",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "Eurofung",
      "url_syntax" : null,
      "datatype" : null
   },
   "merops" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://merops.sanger.ac.uk/cgi-bin/pepsum?mid=A08.001",
      "database" : "MEROPS peptidase database",
      "example_id" : "MEROPS:A08.001",
      "generic_url" : "http://merops.sanger.ac.uk/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "MEROPS",
      "url_syntax" : "http://merops.sanger.ac.uk/cgi-bin/pepsum?mid=[example_id]",
      "datatype" : null
   },
   "casref" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getref.asp?id=2031",
      "database" : "Catalog of Fishes publications database",
      "example_id" : "CASREF:2031",
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "CASREF",
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getref.asp?id=[example_id]",
      "datatype" : null
   },
   "kegg_reaction" : {
      "object" : "Reaction",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?rn:R02328",
      "database" : "KEGG Reaction Database",
      "local_id_syntax" : "^R\\d+$",
      "example_id" : "KEGG:R02328",
      "generic_url" : "http://www.genome.jp/kegg/reaction/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "KEGG_REACTION",
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?rn:[example_id]",
      "datatype" : null
   },
   "merops_fam" : {
      "object" : "Peptidase family identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://merops.sanger.ac.uk/cgi-bin/famsum?family=m18",
      "database" : "MEROPS peptidase database",
      "example_id" : "MEROPS_fam:M18",
      "generic_url" : "http://merops.sanger.ac.uk/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "MEROPS_fam",
      "url_syntax" : "http://merops.sanger.ac.uk/cgi-bin/famsum?family=[example_id]",
      "datatype" : null
   },
   "obo_sf_po" : {
      "object" : "Term request",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "https://sourceforge.net/tracker/index.php?func=detail&aid=3184921&group_id=76834&atid=835555",
      "database" : "Source Forge OBO Plant Ontology (PO) term request tracker",
      "example_id" : "OBO_SF_PO:3184921",
      "generic_url" : "http://sourceforge.net/tracker/?func=browse&group_id=76834&atid=835555",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "OBO_SF_PO",
      "url_syntax" : "https://sourceforge.net/tracker/index.php?func=detail&aid=[example_id]&group_id=76834&atid=835555",
      "datatype" : null
   },
   "kegg_ligand" : {
      "object" : "Compound",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?cpd:C00577",
      "database" : "KEGG LIGAND Database",
      "local_id_syntax" : "^C\\d{5}$",
      "example_id" : "KEGG_LIGAND:C00577",
      "generic_url" : "http://www.genome.ad.jp/kegg/docs/upd_ligand.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "KEGG_LIGAND",
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?cpd:[example_id]",
      "datatype" : null
   },
   "refseq_na" : {
      "object" : "Identifier",
      "replaced_by" : "RefSeq",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=NC_000913",
      "database" : "RefSeq (Nucleic Acid)",
      "example_id" : "RefSeq_NA:NC_000913",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/RefSeq/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "RefSeq_NA",
      "is_obsolete" : "true",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]",
      "datatype" : null
   },
   "ecogene" : {
      "object" : "EcoGene accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ecogene.org/geneInfo.php?eg_id=EG10818",
      "database" : "EcoGene Database of Escherichia coli Sequence and Function",
      "local_id_syntax" : "^EG[0-9]{5}$",
      "example_id" : "ECOGENE:EG10818",
      "generic_url" : "http://www.ecogene.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "ECOGENE",
      "url_syntax" : "http://www.ecogene.org/geneInfo.php?eg_id=[example_id]",
      "datatype" : null
   },
   "jstor" : {
      "object" : "journal article",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.jstor.org/stable/3093870",
      "database" : "Digital archive of scholarly articles",
      "example_id" : "JSTOR:3093870",
      "generic_url" : "http://www.jstor.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "JSTOR",
      "url_syntax" : "http://www.jstor.org/stable/[example_id]",
      "datatype" : null
   },
   "omim" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://omim.org/entry/190198",
      "database" : "Mendelian Inheritance in Man",
      "example_id" : "OMIM:190198",
      "synonym" : "MIM",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?db=OMIM",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "OMIM",
      "url_syntax" : "http://omim.org/entry/[example_id]",
      "datatype" : null
   },
   "imgt_hla" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "IMGT/HLA human major histocompatibility complex sequence database",
      "example_id" : "IMGT_HLA:HLA00031",
      "generic_url" : "http://www.ebi.ac.uk/imgt/hla",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "IMGT_HLA",
      "url_syntax" : null,
      "datatype" : null
   },
   "tgd_locus" : {
      "object" : "Gene name (gene symbol in mammalian nomenclature)",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://db.ciliate.org/cgi-bin/locus.pl?locus=PDD1",
      "database" : "Tetrahymena Genome Database",
      "example_id" : "TGD_LOCUS:PDD1",
      "generic_url" : "http://www.ciliate.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "TGD_LOCUS",
      "url_syntax" : "http://db.ciliate.org/cgi-bin/locus.pl?locus=[example_id]",
      "datatype" : null
   },
   "pmcid" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?db=pmc&cmd=search&term=PMC201377",
      "!url_example" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?cmd=Search&db=PMC&term=PMC201377",
      "database" : "Pubmed Central",
      "example_id" : "PMCID:PMC201377",
      "!url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?cmd=Search&db=PMC&term=[example_id]",
      "generic_url" : "http://www.pubmedcentral.nih.gov/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PMCID",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?db=pmc&cmd=search&term=[example_id]",
      "datatype" : null
   },
   "biomd" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ebi.ac.uk/compneur-srv/biomodels-main/publ-model.do?mid=BIOMD0000000045",
      "database" : "BioModels Database",
      "example_id" : "BIOMD:BIOMD0000000045",
      "synonym" : "BIOMDID",
      "generic_url" : "http://www.ebi.ac.uk/biomodels/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "BIOMD",
      "url_syntax" : "http://www.ebi.ac.uk/compneur-srv/biomodels-main/publ-model.do?mid=[example_id]",
      "datatype" : null
   },
   "pmid" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/pubmed/4208797",
      "database" : "PubMed",
      "example_id" : "PMID:4208797",
      "synonym" : "PubMed",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/PubMed/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PMID",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/pubmed/[example_id]",
      "datatype" : null
   },
   "maizegdb" : {
      "object" : "MaizeGDB Object ID Number",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.maizegdb.org/cgi-bin/id_search.cgi?id=881225",
      "database" : "MaizeGDB",
      "example_id" : "MaizeGDB:881225",
      "generic_url" : "http://www.maizegdb.org",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "MaizeGDB",
      "url_syntax" : "http://www.maizegdb.org/cgi-bin/id_search.cgi?id=[example_id]",
      "datatype" : null
   },
   "ecoliwiki" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "description" : "EcoliHub's subsystem for community annotation of E. coli K-12",
      "database" : "EcoliWiki from EcoliHub",
      "local_id_syntax" : "^[A-Za-z]{3,4}$",
      "generic_url" : "http://ecoliwiki.net/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "EcoliWiki",
      "url_syntax" : null,
      "datatype" : null
   },
   "ensembl_transcriptid" : {
      "object" : "Transcript identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ensembl.org/id/ENST00000371959",
      "database" : "Ensembl database of automatically annotated genomic data",
      "local_id_syntax" : "^ENST[0-9]{9,16}$",
      "example_id" : "ENSEMBL_TranscriptID:ENST00000371959",
      "generic_url" : "http://www.ensembl.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "ENSEMBL_TranscriptID",
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "datatype" : null
   },
   "um-bbd_ruleid" : {
      "object" : "Rule identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://umbbd.msi.umn.edu/servlets/rule.jsp?rule=bt0330",
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "example_id" : "UM-BBD_ruleID:bt0330",
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "UM-BBD_ruleID",
      "url_syntax" : "http://umbbd.msi.umn.edu/servlets/rule.jsp?rule=[example_id]",
      "datatype" : null
   },
   "pharmgkb" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.pharmgkb.org/do/serve?objId=PA267",
      "database" : "Pharmacogenetics and Pharmacogenomics Knowledge Base",
      "example_id" : "PharmGKB:PA267",
      "generic_url" : "http://www.pharmgkb.org",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PharmGKB",
      "url_syntax" : "http://www.pharmgkb.org/do/serve?objId=[example_id]",
      "datatype" : null
   },
   "mesh" : {
      "object" : "MeSH heading",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.nlm.nih.gov/cgi/mesh/2005/MB_cgi?mode=&term=mitosis",
      "database" : "Medical Subject Headings",
      "example_id" : "MeSH:mitosis",
      "generic_url" : "http://www.nlm.nih.gov/mesh/2005/MBrowser.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "MeSH",
      "url_syntax" : "http://www.nlm.nih.gov/cgi/mesh/2005/MB_cgi?mode=&term=[example_id]",
      "datatype" : null
   },
   "phi" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "MeGO (Phage and Mobile Element Ontology)",
      "example_id" : "PHI:0000055",
      "generic_url" : "http://aclame.ulb.ac.be/Classification/mego.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PHI",
      "url_syntax" : null,
      "datatype" : null
   },
   "cbs" : {
      "object" : "prediction tool",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.cbs.dtu.dk/services/[example_id]/",
      "database" : "Center for Biological Sequence Analysis",
      "example_id" : "CBS:TMHMM",
      "generic_url" : "http://www.cbs.dtu.dk/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "CBS",
      "url_syntax" : null,
      "datatype" : null
   },
   "aspgd" : {
      "object" : "Identifier for AspGD Loci",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?dbid=ASPL0000067538",
      "database" : "Aspergillus Genome Database",
      "example_id" : "AspGD:ASPL0005516",
      "synonym" : "AspGDID",
      "generic_url" : "http://www.aspergillusgenome.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "AspGD",
      "url_syntax" : "http://www.aspergillusgenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "datatype" : null
   },
   "vbrc" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://vbrc.org/query.asp?web_id=VBRC:F35742",
      "database" : "Viral Bioinformatics Resource Center",
      "example_id" : "VBRC:F35742",
      "generic_url" : "http://vbrc.org",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "VBRC",
      "url_syntax" : "http://vbrc.org/query.asp?web_id=VBRC:[example_id]",
      "datatype" : null
   },
   "psi-mi" : {
      "object" : "Interaction identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Proteomic Standard Initiative for Molecular Interaction",
      "example_id" : "MI:0018",
      "synonym" : "MI",
      "generic_url" : "http://psidev.sourceforge.net/mi/xml/doc/user/index.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PSI-MI",
      "url_syntax" : null,
      "datatype" : null
   },
   "hpa" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.proteinatlas.org/tissue_profile.php?antibody_id=HPA000237",
      "database" : "Human Protein Atlas tissue profile information",
      "example_id" : "HPA:HPA000237",
      "generic_url" : "http://www.proteinatlas.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "HPA",
      "url_syntax" : "http://www.proteinatlas.org/tissue_profile.php?antibody_id=[example_id]",
      "datatype" : null
   },
   "gonuts" : {
      "object" : "Identifier (for gene or gene product)",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://gowiki.tamu.edu/wiki/index.php/MOUSE:CD28",
      "description" : "Third party documentation for GO and community annotation system.",
      "database" : "Gene Ontology Normal Usage Tracking System (GONUTS)",
      "example_id" : "GONUTS:MOUSE:CD28",
      "generic_url" : "http://gowiki.tamu.edu",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GONUTS",
      "url_syntax" : "http://gowiki.tamu.edu/wiki/index.php/[example_id]",
      "datatype" : null
   },
   "zfin" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://zfin.org/cgi-bin/ZFIN_jump?record=ZDB-GENE-990415-103",
      "database" : "Zebrafish Information Network",
      "local_id_syntax" : "^ZDB-(GENE|GEN|MRPHLNO)-[0-9]{6}-[0-9]+$",
      "example_id" : "ZFIN:ZDB-GENE-990415-103",
      "generic_url" : "http://zfin.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "ZFIN",
      "url_syntax" : "http://zfin.org/cgi-bin/ZFIN_jump?record=[example_id]",
      "datatype" : null
   },
   "protein_id" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "description" : "protein identifier shared by DDBJ/EMBL-bank/GenBank nucleotide sequence databases",
      "database" : "DDBJ / EMBL-Bank / GenBank",
      "local_id_syntax" : "^[A-Z]{3}[0-9]{5}(\\.[0-9]+)?$",
      "example_id" : "protein_id:CAA71991",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Genbank/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "protein_id",
      "url_syntax" : null,
      "datatype" : null
   },
   "pamgo_mgg" : {
      "object" : "Locus",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://scotland.fgl.ncsu.edu/cgi-bin/adHocQuery.cgi?adHocQuery_dbName=smeng_goannotation&Action=Data&QueryName=Functional+Categorization+of+MGG+GO+Annotation&P_KeyWord=MGG_05132",
      "description" : "Magnaporthe grisea database at North Carolina State University; member of PAMGO Interest Group",
      "database" : "Magnaporthe grisea database",
      "example_id" : "PAMGO_MGG:MGG_05132",
      "generic_url" : "http://scotland.fgl.ncsu.edu/smeng/GoAnnotationMagnaporthegrisea.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PAMGO_MGG",
      "url_syntax" : "http://scotland.fgl.ncsu.edu/cgi-bin/adHocQuery.cgi?adHocQuery_dbName=smeng_goannotation&Action=Data&QueryName=Functional+Categorization+of+MGG+GO+Annotation&P_KeyWord=[example_id]",
      "datatype" : null
   },
   "unimod" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.unimod.org/modifications_view.php?editid1=1287",
      "description" : "protein modifications for mass spectrometry",
      "database" : "UniMod",
      "example_id" : "UniMod:1287",
      "generic_url" : "http://www.unimod.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "UniMod",
      "url_syntax" : "http://www.unimod.org/modifications_view.php?editid1=[example_id]",
      "datatype" : null
   },
   "iuphar_gpcr" : {
      "object" : "G-protein-coupled receptor family identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.iuphar-db.org/DATABASE/FamilyMenuForward?familyId=13",
      "database" : "International Union of Pharmacology",
      "example_id" : "IUPHAR_GPCR:1279",
      "generic_url" : "http://www.iuphar.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "IUPHAR_GPCR",
      "url_syntax" : "http://www.iuphar-db.org/DATABASE/FamilyMenuForward?familyId=[example_id]",
      "datatype" : null
   },
   "jcvi" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "J. Craig Venter Institute",
      "synonym" : "TIGR",
      "generic_url" : "http://www.jcvi.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "JCVI",
      "url_syntax" : null,
      "datatype" : null
   },
   "echobase" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.biolws1.york.ac.uk/echobase/Gene.cfm?recordID=EB0231",
      "database" : "EchoBASE post-genomic database for Escherichia coli",
      "local_id_syntax" : "^EB[0-9]{4}$",
      "example_id" : "EchoBASE:EB0231",
      "generic_url" : "http://www.ecoli-york.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "EchoBASE",
      "url_syntax" : "http://www.biolws1.york.ac.uk/echobase/Gene.cfm?recordID=[example_id]",
      "datatype" : null
   },
   "cl" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://purl.obolibrary.org/obo/CL_0000041",
      "database" : "Cell Type Ontology",
      "local_id_syntax" : "^[0-9]{7}$",
      "example_id" : "CL:0000041",
      "generic_url" : "http://cellontology.org",
      "entity_type" : "CL:0000000 ! cell ",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "CL",
      "url_syntax" : "http://purl.obolibrary.org/obo/CL_[example_id]",
      "datatype" : null
   },
   "go_ref" : {
      "object" : "Accession (for reference)",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.geneontology.org/cgi-bin/references.cgi#GO_REF:0000001",
      "database" : "Gene Ontology Database references",
      "local_id_syntax" : "^\\d{7}$",
      "example_id" : "GO_REF:0000001",
      "generic_url" : "http://www.geneontology.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GO_REF",
      "url_syntax" : "http://www.geneontology.org/cgi-bin/references.cgi#GO_REF:[example_id]",
      "datatype" : null
   },
   "hgnc_gene" : {
      "object" : "Gene symbol",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.genenames.org/data/hgnc_data.php?app_sym=ABCA1",
      "database" : "HUGO Gene Nomenclature Committee",
      "example_id" : "HGNC_gene:ABCA1",
      "generic_url" : "http://www.genenames.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "HGNC_gene",
      "url_syntax" : "http://www.genenames.org/data/hgnc_data.php?app_sym=[example_id]",
      "datatype" : null
   },
   "biopixie_mefit" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "biological Process Inference from eXperimental Interaction Evidence/Microarray Experiment Functional Integration Technology",
      "generic_url" : "http://pixie.princeton.edu/pixie/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "bioPIXIE_MEFIT",
      "url_syntax" : null,
      "datatype" : null
   },
   "obi" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Ontology for Biomedical Investigations",
      "local_id_syntax" : "^\\d{7}$",
      "example_id" : "OBI:0000038",
      "generic_url" : "http://obi-ontology.org/page/Main_Page",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "OBI",
      "url_syntax" : null,
      "datatype" : null
   },
   "brenda" : {
      "object" : "EC enzyme identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.brenda-enzymes.info/php/result_flat.php4?ecno=4.2.1.3",
      "database" : "BRENDA, The Comprehensive Enzyme Information System",
      "example_id" : "BRENDA:4.2.1.3",
      "generic_url" : "http://www.brenda-enzymes.info",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "BRENDA",
      "url_syntax" : "http://www.brenda-enzymes.info/php/result_flat.php4?ecno=[example_id]",
      "datatype" : null
   },
   "resid" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "RESID Database of Protein Modifications",
      "example_id" : "RESID:AA0062",
      "generic_url" : "ftp://ftp.ncifcrf.gov/pub/users/residues/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "RESID",
      "url_syntax" : null,
      "datatype" : null
   },
   "trait" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "description" : "an integrated database of transcripts expressed in human skeletal muscle",
      "database" : "TRAnscript Integrated Table",
      "synonym" : "MuscleTRAIT",
      "generic_url" : "http://muscle.cribi.unipd.it/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "TRAIT",
      "url_syntax" : null,
      "datatype" : null
   },
   "intact" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ebi.ac.uk/intact/search/do/search?searchString=EBI-17086",
      "database" : "IntAct protein interaction database",
      "local_id_syntax" : "^[0-9]+$",
      "example_id" : "IntAct:EBI-17086",
      "generic_url" : "http://www.ebi.ac.uk/intact/",
      "entity_type" : "MI:0315 ! protein complex ",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "IntAct",
      "url_syntax" : "http://www.ebi.ac.uk/intact/search/do/search?searchString=[example_id]",
      "datatype" : null
   },
   "transfac" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "TRANSFAC database of eukaryotic transcription factors",
      "generic_url" : "http://www.gene-regulation.com/pub/databases.html#transfac",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "TRANSFAC",
      "url_syntax" : null,
      "datatype" : null
   },
   "sgn_ref" : {
      "object" : "Reference identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.sgn.cornell.edu/chado/publication.pl?pub_id=861",
      "database" : "Sol Genomics Network",
      "example_id" : "SGN_ref:861",
      "generic_url" : "http://www.sgn.cornell.edu/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "SGN_ref",
      "url_syntax" : "http://www.sgn.cornell.edu/chado/publication.pl?pub_id=[example_id]",
      "datatype" : null
   },
   "ncbi" : {
      "object" : "Prefix",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "! url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=",
      "database" : "National Center for Biotechnology Information",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "NCBI",
      "! url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?val=[example_id]",
      "url_syntax" : null,
      "datatype" : null
   },
   "cgsc" : {
      "object" : "Gene symbol",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://cgsc.biology.yale.edu/Site.php?ID=315",
      "example_id" : "CGSC:rbsK",
      "database: CGSC" : "E.coli Genetic Stock Center",
      "generic_url" : "http://cgsc.biology.yale.edu/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "CGSC",
      "url_syntax" : null,
      "datatype" : null
   },
   "spd" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.riken.jp/SPD/05/05F01.html",
      "database" : "Schizosaccharomyces pombe Postgenome Database at RIKEN; includes Orfeome Localisation data",
      "local_id_syntax" : "^[0-9]{2}/[0-9]{2}[A-Z][0-9]{2}$",
      "example_id" : "SPD:05/05F01",
      "generic_url" : "http://www.riken.jp/SPD/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "SPD",
      "url_syntax" : "http://www.riken.jp/SPD/[example_id].html",
      "datatype" : null
   },
   "genedb_tbrucei" : {
      "object" : "Gene identifier",
      "shorthand_name" : "Tbrucei",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.genedb.org/genedb/Search?organism=tryp&name=Tb927.1.5250",
      "database" : "Trypanosoma brucei GeneDB",
      "local_id_syntax" : "^Tb\\d+\\.\\d+\\.\\d+$",
      "example_id" : "GeneDB_Tbrucei:Tb927.1.5250",
      "generic_url" : "http://www.genedb.org/genedb/tryp/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GeneDB_Tbrucei",
      "url_syntax" : "http://www.genedb.org/genedb/Search?organism=tryp&name=[example_id]",
      "datatype" : null
   },
   "ensembl_geneid" : {
      "object" : "Gene identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ensembl.org/id/ENSG00000126016",
      "database" : "Ensembl database of automatically annotated genomic data",
      "local_id_syntax" : "^ENSG[0-9]{9,16}$",
      "example_id" : "ENSEMBL_GeneID:ENSG00000126016",
      "generic_url" : "http://www.ensembl.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "ENSEMBL_GeneID",
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "datatype" : null
   },
   "unigene" : {
      "object" : "Identifier (for transcript cluster)",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/UniGene/clust.cgi?ORG=Hs&CID=212293",
      "description" : "NCBI transcript cluster database, organized by transcriptome. Each UniGene entry is a set of transcript sequences that appear to come from the same transcription locus (gene or expressed pseudogene).",
      "database" : "UniGene",
      "example_id" : "UniGene:Hs.212293",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/UniGene",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "UniGene",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/UniGene/clust.cgi?ORG=[organism_abbreviation]&CID=[cluster_id]",
      "datatype" : null
   },
   "gr_protein" : {
      "object" : "Protein identifier",
      "database: Gramene" : "A Comparative Mapping Resource for Grains",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.gramene.org/db/protein/protein_search?acc=Q6VSV0",
      "local_id_syntax" : "^[A-Z][0-9][A-Z0-9]{3}[0-9]$",
      "example_id" : "GR_PROTEIN:Q6VSV0",
      "synonym" : "GR_protein",
      "generic_url" : "http://www.gramene.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GR_PROTEIN",
      "url_syntax" : "http://www.gramene.org/db/protein/protein_search?acc=[example_id]",
      "datatype" : null
   },
   "pamgo_vmd" : {
      "object" : "Gene identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://vmd.vbi.vt.edu/cgi-bin/browse/go_detail.cgi?gene_id=109198",
      "description" : "Virginia Bioinformatics Institute Microbial Database; member of PAMGO Interest Group",
      "database" : "Virginia Bioinformatics Institute Microbial Database",
      "example_id" : "PAMGO_VMD:109198",
      "generic_url" : "http://phytophthora.vbi.vt.edu",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PAMGO_VMD",
      "url_syntax" : "http://vmd.vbi.vt.edu/cgi-bin/browse/go_detail.cgi?gene_id=[example_id]",
      "datatype" : null
   },
   "cgd_ref" : {
      "object" : "Literature Reference Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.candidagenome.org/cgi-bin/reference/reference.pl?dbid=1490",
      "database" : "Candida Genome Database",
      "example_id" : "CGD_REF:1490",
      "generic_url" : "http://www.candidagenome.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "CGD_REF",
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/reference/reference.pl?dbid=[example_id]",
      "datatype" : null
   },
   "sabio-rk" : {
      "object" : "reaction",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://sabio.villa-bosch.de/reacdetails.jsp?reactid=1858",
      "description" : "The SABIO-RK (System for the Analysis of Biochemical Pathways - Reaction Kinetics) is a web-based application based on the SABIO relational database that contains information about biochemical reactions, their kinetic equations with their parameters, and the experimental conditions under which these parameters were measured.",
      "database" : "SABIO Reaction Kinetics",
      "example_id" : "SABIO-RK:1858",
      "generic_url" : "http://sabio.villa-bosch.de/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "SABIO-RK",
      "url_syntax" : "http://sabio.villa-bosch.de/reacdetails.jsp?reactid=[example_id]",
      "datatype" : null
   },
   "cog_function" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/COG/grace/shokog.cgi?fun=H",
      "database" : "NCBI COG function",
      "example_id" : "COG_Function:H",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "COG_Function",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/COG/grace/shokog.cgi?fun=[example_id]",
      "datatype" : null
   },
   "ncbi_gp" : {
      "object" : "Protein identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=protein&val=EAL72968",
      "database" : "NCBI GenPept",
      "local_id_syntax" : "^[A-Z]{3}[0-9]{5}(\\.[0-9]+)?$",
      "example_id" : "NCBI_GP:EAL72968",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "NCBI_GP",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=protein&val=[example_id]",
      "datatype" : null
   },
   "vida" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Virus Database at University College London",
      "generic_url" : "http://www.biochem.ucl.ac.uk/bsm/virus_database/VIDA.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "VIDA",
      "url_syntax" : null,
      "datatype" : null
   },
   "doi" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://dx.doi.org/DOI:10.1016/S0963-9969(99)00021-6",
      "database" : "Digital Object Identifier",
      "example_id" : "DOI:10.1016/S0963-9969(99)00021-6",
      "generic_url" : "http://dx.doi.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "DOI",
      "url_syntax" : "http://dx.doi.org/DOI:[example_id]",
      "datatype" : null
   },
   "sgd_locus" : {
      "object" : "Gene name (gene symbol in mammalian nomenclature)",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://db.yeastgenome.org/cgi-bin/locus.pl?locus=GAL4",
      "database" : "Saccharomyces Genome Database",
      "example_id" : "SGD_LOCUS:GAL4",
      "generic_url" : "http://www.yeastgenome.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "SGD_LOCUS",
      "url_syntax" : "http://db.yeastgenome.org/cgi-bin/locus.pl?locus=[example_id]",
      "datatype" : null
   },
   "um-bbd_reactionid" : {
      "object" : "Reaction identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=r&reacID=r0129",
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "example_id" : "UM-BBD_reactionID:r0129",
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "UM-BBD_reactionID",
      "url_syntax" : "http://umbbd.msi.umn.edu/servlets/pageservlet?ptype=r&reacID=[example_id]",
      "datatype" : null
   },
   "nmpdr" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.nmpdr.org/linkin.cgi?id=fig|306254.1.peg.183",
      "database" : "National Microbial Pathogen Data Resource",
      "example_id" : "NMPDR:fig|306254.1.peg.183",
      "generic_url" : "http://www.nmpdr.org",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "NMPDR",
      "url_syntax" : "http://www.nmpdr.org/linkin.cgi?id=[example_id]",
      "datatype" : null
   },
   "tgd_ref" : {
      "object" : "Literature Reference Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://db.ciliate.org/cgi-bin/reference/reference.pl?dbid=T000005818",
      "database" : "Tetrahymena Genome Database",
      "example_id" : "TGD_REF:T000005818",
      "generic_url" : "http://www.ciliate.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "TGD_REF",
      "url_syntax" : "http://db.ciliate.org/cgi-bin/reference/reference.pl?dbid=[example_id]",
      "datatype" : null
   },
   "agi_locuscode" : {
      "object" : "Locus identifier",
      "uri_prefix" : null,
      "local_id_syntax" : "^AT[MC0-5]G[0-9]{5}(\\.[0-9]{1})?$",
      "example_id" : "AGI_LocusCode:At2g17950",
      "!url_syntax" : "http://www.tigr.org/tigr-scripts/euk_manatee/shared/ORF_infopage.cgi?db=ath1&orf=[example_id]",
      "generic_url" : "http://www.arabidopsis.org",
      "id" : null,
      "url_syntax" : "http://arabidopsis.org/servlets/TairObject?type=locus&name=[example_id]",
      "name" : null,
      "url_example" : "http://arabidopsis.org/servlets/TairObject?type=locus&name=At2g17950",
      "description" : "Comprises TAIR, TIGR and MIPS",
      "database" : "Arabidopsis Genome Initiative",
      "!url_example" : "http://www.tigr.org/tigr-scripts/euk_manatee/shared/ORF_infopage.cgi?db=ath1&orf=At2g17950",
      "fullname" : null,
      "abbreviation" : "AGI_LocusCode",
      "datatype" : null
   },
   "jcvi_ath1" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Arabidopsis thaliana database at the J. Craig Venter Institute",
      "example_id" : "JCVI_Ath1:At3g01440",
      "synonym" : "TIGR_Ath1",
      "generic_url" : "http://www.tigr.org/tdb/e2k1/ath1/ath1.shtml",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "JCVI_Ath1",
      "is_obsolete" : "true",
      "url_syntax" : null,
      "datatype" : null
   },
   "nasc_code" : {
      "object" : "NASC code Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://seeds.nottingham.ac.uk/NASC/stockatidb.lasso?code=N3371",
      "database" : "Nottingham Arabidopsis Stock Centre Seeds Database",
      "example_id" : "NASC_code:N3371",
      "generic_url" : "http://arabidopsis.info",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "NASC_code",
      "url_syntax" : "http://seeds.nottingham.ac.uk/NASC/stockatidb.lasso?code=[example_id]",
      "datatype" : null
   },
   "mo" : {
      "object" : "ontology term",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://mged.sourceforge.net/ontologies/MGEDontology.php#Action",
      "database" : "MGED Ontology",
      "example_id" : "MO:Action",
      "generic_url" : "http://mged.sourceforge.net/ontologies/MGEDontology.php",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "MO",
      "url_syntax" : "http://mged.sourceforge.net/ontologies/MGEDontology.php#[example_id]",
      "datatype" : null
   },
   "lifedb" : {
      "object" : "cDNA clone identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.dkfz.de/LIFEdb/LIFEdb.aspx?ID=DKFZp564O1716",
      "description" : "LifeDB is a database for information on protein localization, interaction, functional assays and expression.",
      "database" : "LifeDB",
      "example_id" : "LIFEdb:DKFZp564O1716",
      "generic_url" : "http://www.lifedb.de/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "LIFEdb",
      "url_syntax" : "http://www.dkfz.de/LIFEdb/LIFEdb.aspx?ID=[example_id]",
      "datatype" : null
   },
   "pamgo" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Plant-Associated Microbe Gene Ontology Interest Group",
      "generic_url" : "http://pamgo.vbi.vt.edu/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PAMGO",
      "url_syntax" : null,
      "datatype" : null
   },
   "gr" : {
      "object" : "Identifier (any)",
      "database: Gramene" : "A Comparative Mapping Resource for Grains",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.gramene.org/db/searches/browser?search_type=All&RGN=on&query=sd1",
      "example_id" : "GR:sd1",
      "generic_url" : "http://www.gramene.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GR",
      "url_syntax" : "http://www.gramene.org/db/searches/browser?search_type=All&RGN=on&query=[example_id]",
      "datatype" : null
   },
   "roslin_institute" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Roslin Institute",
      "synonym" : "RI",
      "generic_url" : "http://www.roslin.ac.uk/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "Roslin_Institute",
      "url_syntax" : null,
      "datatype" : null
   },
   "tgd" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Tetrahymena Genome Database",
      "generic_url" : "http://www.ciliate.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "TGD",
      "url_syntax" : null,
      "datatype" : null
   },
   "mgd" : {
      "object" : "Gene symbol",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Mouse Genome Database",
      "example_id" : "MGD:Adcy9",
      "generic_url" : "http://www.informatics.jax.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "MGD",
      "! url_syntax" : "http://www.informatics.jax.org/searches/marker.cgi?",
      "url_syntax" : null,
      "datatype" : null
   },
   "pamgo_gat" : {
      "object" : "Gene",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://agro.vbi.vt.edu/public/servlet/GeneEdit?&Search=Search&level=2&genename=atu0001",
      "database" : "Genome Annotation Tool (Agrobacterium tumefaciens C58); PAMGO Interest Group",
      "example_id" : "PAMGO_GAT:Atu0001",
      "generic_url" : "http://agro.vbi.vt.edu/public/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PAMGO_GAT",
      "url_syntax" : "http://agro.vbi.vt.edu/public/servlet/GeneEdit?&Search=Search&level=2&genename=[example_id]",
      "datatype" : null
   },
   "swiss-prot" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.uniprot.org/uniprot/P51587",
      "description" : "A curated protein sequence database which provides a high level of annotation and a minimal level of redundancy",
      "database" : "UniProtKB/Swiss-Prot",
      "example_id" : "Swiss-Prot:P51587",
      "synonym" : "UniProtKB/Swiss-Prot",
      "generic_url" : "http://www.uniprot.org",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "Swiss-Prot",
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "datatype" : null
   },
   "fbbt" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://flybase.org/cgi-bin/fbcvq.html?query=FBbt:00005177",
      "database" : "Drosophila gross anatomy",
      "example_id" : "FBbt:00005177",
      "generic_url" : "http://flybase.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "FBbt",
      "url_syntax" : "http://flybase.org/cgi-bin/fbcvq.html?query=FBbt:[example_id]",
      "datatype" : null
   },
   "cog_pathway" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/COG/new/release/coglist.cgi?pathw=14",
      "database" : "NCBI COG pathway",
      "example_id" : "COG_Pathway:14",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "COG_Pathway",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/COG/new/release/coglist.cgi?pathw=[example_id]",
      "datatype" : null
   },
   "hugo" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Human Genome Organisation",
      "generic_url" : "http://www.hugo-international.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "HUGO",
      "url_syntax" : null,
      "datatype" : null
   },
   "dictybase" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://dictybase.org/gene/DDB_G0277859",
      "database" : "dictyBase",
      "local_id_syntax" : "^DDB_G[0-9]{7}$",
      "example_id" : "dictyBase:DDB_G0277859",
      "synonym" : "DictyBase",
      "generic_url" : "http://dictybase.org",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "dictyBase",
      "url_syntax" : "http://dictybase.org/gene/[example_id]",
      "datatype" : null
   },
   "wb_ref" : {
      "object" : "Literature Reference Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.wormbase.org/db/misc/paper?name=WBPaper00004823",
      "database" : "WormBase database of nematode biology",
      "example_id" : "WB_REF:WBPaper00004823",
      "generic_url" : "http://www.wormbase.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "WB_REF",
      "url_syntax" : "http://www.wormbase.org/db/misc/paper?name=[example_id]",
      "datatype" : null
   },
   "kegg_pathway" : {
      "object" : "Pathway",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?path:ot00020",
      "database" : "KEGG Pathways Database",
      "example_id" : "KEGG_PATHWAY:ot00020",
      "generic_url" : "http://www.genome.jp/kegg/pathway.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "KEGG_PATHWAY",
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?path:[example_id]",
      "datatype" : null
   },
   "pdb" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.rcsb.org/pdb/cgi/explore.cgi?pdbId=1A4U",
      "database" : "Protein Data Bank",
      "local_id_syntax" : "^[A-Za-z0-9]{4}$",
      "example_id" : "PDB:1A4U",
      "generic_url" : "http://www.rcsb.org/pdb/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PDB",
      "url_syntax" : "http://www.rcsb.org/pdb/cgi/explore.cgi?pdbId=[example_id]",
      "datatype" : null
   },
   "agbase" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "AgBase resource for functional analysis of agricultural plant and animal gene products",
      "generic_url" : "http://www.agbase.msstate.edu/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "AgBase",
      "url_syntax" : "http://www.agbase.msstate.edu/cgi-bin/getEntry.pl?db_pick=[ChickGO/MaizeGO]&uid=[example_id]",
      "datatype" : null
   },
   "embl" : {
      "object" : "Sequence accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ebi.ac.uk/cgi-bin/emblfetch?style=html&Submit=Go&id=AA816246",
      "description" : "International nucleotide sequence database collaboration, comprising EMBL-EBI nucleotide sequence data library (EMBL-Bank), DNA DataBank of Japan (DDBJ), and NCBI GenBank",
      "database" : "EMBL Nucleotide Sequence Database",
      "local_id_syntax" : "^([A-Z]{1}[0-9]{5})|([A-Z]{2}[0-9]{6})|([A-Z]{4}[0-9]{8,9})$",
      "example_id" : "EMBL:AA816246",
      "generic_url" : "http://www.ebi.ac.uk/embl/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "EMBL",
      "url_syntax" : "http://www.ebi.ac.uk/cgi-bin/emblfetch?style=html&Submit=Go&id=[example_id]",
      "datatype" : null
   },
   "ena" : {
      "object" : "Sequence accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ebi.ac.uk/ena/data/view/AA816246",
      "description" : "ENA is made up of a number of distinct databases that includes EMBL-Bank, the newly established Sequence Read Archive (SRA) and the Trace Archive. International nucleotide sequence database collaboration, comprising ENA-EBI nucleotide sequence data library (EMBL-Bank), DNA DataBank of Japan (DDBJ), and NCBI GenBank",
      "database" : "European Nucleotide Archive",
      "local_id_syntax" : "^([A-Z]{1}[0-9]{5})|([A-Z]{2}[0-9]{6})|([A-Z]{4}[0-9]{8,9})$",
      "example_id" : "ENA:AA816246",
      "generic_url" : "http://www.ebi.ac.uk/ena/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "ENA",
      "url_syntax" : "http://www.ebi.ac.uk/ena/data/view/[example_id]",
      "datatype" : null
   },
   "pseudocap" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://v2.pseudomonas.com/getAnnotation.do?locusID=PA4756",
      "database" : "Pseudomonas Genome Project",
      "example_id" : "PseudoCAP:PA4756",
      "generic_url" : "http://v2.pseudomonas.com/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PseudoCAP",
      "url_syntax" : "http://v2.pseudomonas.com/getAnnotation.do?locusID=[example_id]",
      "datatype" : null
   },
   "gr_qtl" : {
      "object" : "QTL identifier",
      "database: Gramene" : "A Comparative Mapping Resource for Grains",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.gramene.org/db/qtl/qtl_display?qtl_accession_id=CQU7",
      "example_id" : "GR_QTL:CQU7",
      "generic_url" : "http://www.gramene.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GR_QTL",
      "url_syntax" : "http://www.gramene.org/db/qtl/qtl_display?qtl_accession_id=[example_id]",
      "datatype" : null
   },
   "dbsnp" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=rs3131969",
      "database" : "NCBI dbSNP",
      "local_id_syntax" : "^\\d+$",
      "example_id" : "dbSNP:rs3131969",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/projects/SNP",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "dbSNP",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=[example_id]",
      "datatype" : null
   },
   "agricola_id" : {
      "object" : "AGRICOLA call number",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "AGRICultural OnLine Access",
      "example_id" : "AGRICOLA_NAL:TP248.2 P76 v.14",
      "generic_url" : "http://agricola.nal.usda.gov/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "AGRICOLA_ID",
      "url_syntax" : null,
      "datatype" : null
   },
   "ptarget" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "pTARGET Prediction server for protein subcellular localization",
      "generic_url" : "http://bioinformatics.albany.edu/~ptarget/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "pTARGET",
      "url_syntax" : null,
      "datatype" : null
   },
   "apidb_plasmodb" : {
      "object" : "PlasmoDB Gene ID",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.plasmodb.org/gene/PF11_0344",
      "database" : "PlasmoDB Plasmodium Genome Resource",
      "example_id" : "ApiDB_PlasmoDB:PF11_0344",
      "generic_url" : "http://plasmodb.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "ApiDB_PlasmoDB",
      "url_syntax" : "http://www.plasmodb.org/gene/[example_id]",
      "datatype" : null
   },
   "trembl" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.uniprot.org/uniprot/O31124",
      "description" : "UniProtKB-TrEMBL, a computer-annotated protein sequence database supplementing UniProtKB and containing the translations of all coding sequences (CDS) present in the EMBL Nucleotide Sequence Database but not yet integrated in UniProtKB/Swiss-Prot",
      "database" : "UniProtKB-TrEMBL protein sequence database",
      "example_id" : "TrEMBL:O31124",
      "synonym" : "UniProtKB/TrEMBL",
      "generic_url" : "http://www.uniprot.org",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "TrEMBL",
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "datatype" : null
   },
   "ecogene_g" : {
      "object" : "EcoGene Primary Gene Name",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "EcoGene Database of Escherichia coli Sequence and Function",
      "example_id" : "ECOGENE_G:deoC",
      "generic_url" : "http://www.ecogene.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "ECOGENE_G",
      "url_syntax" : null,
      "datatype" : null
   },
   "cog_cluster" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/COG/new/release/cow.cgi?cog=COG0001",
      "database" : "NCBI COG cluster",
      "example_id" : "COG_Cluster:COG0001",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "COG_Cluster",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/COG/new/release/cow.cgi?cog=[example_id]",
      "datatype" : null
   },
   "paint_ref" : {
      "object" : "Reference locator",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.geneontology.org/gene-associations/submission/paint/PTHR10046/PTHR10046.txt",
      "database" : "Phylogenetic Annotation INference Tool References",
      "example_id" : "PAINT_REF:PTHR10046",
      "generic_url" : "http://www.pantherdb.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PAINT_REF",
      "url_syntax" : "http://www.geneontology.org/gene-associations/submission/paint/[example_id]/[example_id].txt",
      "datatype" : null
   },
   "nif_subcellular" : {
      "object" : "ontology term",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.neurolex.org/wiki/sao1770195789",
      "database" : "Neuroscience Information Framework standard ontology, subcellular hierarchy",
      "example_id" : "NIF_Subcellular:sao1186862860",
      "generic_url" : "http://www.neurolex.org/wiki",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "NIF_Subcellular",
      "url_syntax" : "http://www.neurolex.org/wiki/[example_id]",
      "datatype" : null
   },
   "genedb_pfalciparum" : {
      "object" : "Gene identifier",
      "shorthand_name" : "Pfalciparum",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.genedb.org/genedb/Search?organism=malaria&name=PFD0755c",
      "database" : "Plasmodium falciparum GeneDB",
      "local_id_syntax" : "^SP[A-Z0-9]+\\.[A-Za-z0-9]+$",
      "example_id" : "GeneDB_Pfalciparum:PFD0755c",
      "generic_url" : "http://www.genedb.org/genedb/malaria/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GeneDB_Pfalciparum",
      "url_syntax" : "http://www.genedb.org/genedb/Search?organism=malaria&name=[example_id]",
      "datatype" : null
   },
   "pubchem_bioassay" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://pubchem.ncbi.nlm.nih.gov/assay/assay.cgi?aid=177",
      "database" : "NCBI PubChem database of bioassay records",
      "example_id" : "PubChem_BioAssay:177",
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PubChem_BioAssay",
      "url_syntax" : "http://pubchem.ncbi.nlm.nih.gov/assay/assay.cgi?aid=[example_id]",
      "datatype" : null
   },
   "fb" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://flybase.org/reports/FBgn0000024.html",
      "database" : "FlyBase",
      "local_id_syntax" : "^FBgn[0-9]{7}$",
      "example_id" : "FB:FBgn0000024",
      "synonym" : "FLYBASE",
      "generic_url" : "http://flybase.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "FB",
      "url_syntax" : "http://flybase.org/reports/[example_id].html",
      "datatype" : null
   },
   "issn" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "International Standard Serial Number",
      "example_id" : "ISSN:1234-1231",
      "generic_url" : "http://www.issn.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "ISSN",
      "url_syntax" : null,
      "datatype" : null
   },
   "h-invdb" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "H-invitational Database",
      "generic_url" : "http://www.h-invitational.jp/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "H-invDB",
      "url_syntax" : null,
      "datatype" : null
   },
   "kegg" : {
      "object" : "identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Kyoto Encyclopedia of Genes and Genomes",
      "generic_url" : "http://www.genome.ad.jp/kegg/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "KEGG",
      "url_syntax" : null,
      "datatype" : null
   },
   "smart" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://smart.embl-heidelberg.de/smart/do_annotation.pl?BLAST=DUMMY&DOMAIN=SM00005",
      "database" : "Simple Modular Architecture Research Tool",
      "example_id" : "SMART:SM00005",
      "generic_url" : "http://smart.embl-heidelberg.de/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "SMART",
      "url_syntax" : "http://smart.embl-heidelberg.de/smart/do_annotation.pl?BLAST=DUMMY&DOMAIN=[example_id]",
      "datatype" : null
   },
   "fypo" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Fission Yeast Phenotype Ontology",
      "local_id_syntax" : "^\\d{7}$",
      "example_id" : "FYPO:0000001",
      "generic_url" : "http://www.pombase.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "FYPO",
      "url_syntax" : null,
      "datatype" : null
   },
   "tair" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://arabidopsis.org/servlets/TairObject?accession=locus:2146653",
      "database" : "The Arabidopsis Information Resource",
      "local_id_syntax" : "^locus:[0-9]{7}$",
      "example_id" : "TAIR:locus:2146653",
      "generic_url" : "http://www.arabidopsis.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "TAIR",
      "url_syntax" : "http://arabidopsis.org/servlets/TairObject?accession=[example_id]",
      "datatype" : null
   },
   "jcvi_medtr" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://medicago.jcvi.org/cgi-bin/medicago/search/shared/ORF_infopage.cgi?orf=Medtr5g024510",
      "database" : "Medicago truncatula genome database at the J. Craig Venter Institute ",
      "example_id" : "JCVI_Medtr:Medtr5g024510",
      "generic_url" : "http://medicago.jcvi.org/cgi-bin/medicago/overview.cgi",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "JCVI_Medtr",
      "url_syntax" : "http://medicago.jcvi.org/cgi-bin/medicago/search/shared/ORF_infopage.cgi?orf=[example_id]",
      "datatype" : null
   },
   "psort" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "PSORT protein subcellular localization databases and prediction tools for bacteria",
      "generic_url" : "http://www.psort.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PSORT",
      "url_syntax" : null,
      "datatype" : null
   },
   "pompep" : {
      "object" : "Gene/protein identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Schizosaccharomyces pombe protein data",
      "example_id" : "Pompep:SPAC890.04C",
      "generic_url" : "ftp://ftp.sanger.ac.uk/pub/yeast/pombe/Protein_data/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "Pompep",
      "url_syntax" : null,
      "datatype" : null
   },
   "hpa_antibody" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.proteinatlas.org/antibody_info.php?antibody_id=HPA000237",
      "database" : "Human Protein Atlas antibody information",
      "example_id" : "HPA_antibody:HPA000237",
      "generic_url" : "http://www.proteinatlas.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "HPA_antibody",
      "url_syntax" : "http://www.proteinatlas.org/antibody_info.php?antibody_id=[example_id]",
      "datatype" : null
   },
   "rnamods" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://s59.cas.albany.edu/RNAmods/cgi-bin/rnashow.cgi?091",
      "database" : "RNA Modification Database",
      "example_id" : "RNAmods:037",
      "synonym" : "RNAMDB",
      "generic_url" : "http://s59.cas.albany.edu/RNAmods/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "RNAmods",
      "url_syntax" : "http://s59.cas.albany.edu/RNAmods/cgi-bin/rnashow.cgi?[example_id]",
      "datatype" : null
   },
   "ensemblplants/gramene" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ensemblgenomes.org/id/LOC_Os01g22954",
      "database" : "Ensembl Plants, the Ensembl Genomes database for accessing plant genome data",
      "example_id" : "EnsemblPlants:LOC_Os01g22954",
      "synonym" : "EnsemblPlants",
      "generic_url" : "http://plants.ensembl.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "EnsemblPlants/Gramene",
      "url_syntax" : "http://www.ensemblgenomes.org/id/[example_ID]",
      "datatype" : null
   },
   "sgd" : {
      "object" : "Identifier for SGD Loci",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://db.yeastgenome.org/cgi-bin/locus.pl?dbid=S000006169",
      "database" : "Saccharomyces Genome Database",
      "local_id_syntax" : "^S[0-9]{9}$",
      "example_id" : "SGD:S000006169",
      "synonym" : "SGDID",
      "generic_url" : "http://www.yeastgenome.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "SGD",
      "url_syntax" : "http://db.yeastgenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "datatype" : null
   },
   "pato" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Phenotypic quality ontology",
      "example_id" : "PATO:0001420",
      "generic_url" : "http://www.bioontology.org/wiki/index.php/PATO:Main_Page",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PATO",
      "url_syntax" : null,
      "datatype" : null
   },
   "sgn" : {
      "object" : "Gene identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.sgn.cornell.edu/phenome/locus_display.pl?locus_id=4476",
      "database" : "Sol Genomics Network",
      "example_id" : "SGN:4476",
      "generic_url" : "http://www.sgn.cornell.edu/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "SGN",
      "url_syntax" : "http://www.sgn.cornell.edu/phenome/locus_display.pl?locus_id=[example_id]",
      "datatype" : null
   },
   "goc" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Gene Ontology Consortium",
      "generic_url" : "http://www.geneontology.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GOC",
      "url_syntax" : null,
      "datatype" : null
   },
   "genprotec" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "GenProtEC E. coli genome and proteome database",
      "generic_url" : "http://genprotec.mbl.edu/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GenProtEC",
      "url_syntax" : null,
      "datatype" : null
   },
   "nc-iubmb" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Nomenclature Committee of the International Union of Biochemistry and Molecular Biology",
      "generic_url" : "http://www.chem.qmw.ac.uk/iubmb/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "NC-IUBMB",
      "url_syntax" : null,
      "datatype" : null
   },
   "um-bbd_pathwayid" : {
      "object" : "Pathway identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://umbbd.msi.umn.edu/acr/acr_map.html",
      "database" : "University of Minnesota Biocatalysis/Biodegradation Database",
      "example_id" : "UM-BBD_pathwayID:acr",
      "generic_url" : "http://umbbd.msi.umn.edu/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "UM-BBD_pathwayID",
      "url_syntax" : "http://umbbd.msi.umn.edu/[example_id]/[example_id]_map.html",
      "datatype" : null
   },
   "ec" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.expasy.org/enzyme/1.4.3.6",
      "! url_example" : "http://www.chem.qmw.ac.uk/iubmb/enzyme/EC1/4/3/6.html",
      "database" : "Enzyme Commission",
      "example_id" : "EC:1.4.3.6",
      "generic_url" : "http://www.chem.qmul.ac.uk/iubmb/enzyme/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "EC",
      "url_syntax" : "http://www.expasy.org/enzyme/[example_id]",
      "datatype" : null
   },
   "modbase" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://salilab.org/modbase/searchbyid?databaseID=P04848",
      "database" : "ModBase comprehensive Database of Comparative Protein Structure Models",
      "example_id" : "ModBase:P10815",
      "generic_url" : "http://modbase.compbio.ucsf.edu/ ",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "ModBase",
      "url_syntax" : "http://salilab.org/modbase/searchbyid?databaseID=[example_id]",
      "datatype" : null
   },
   "po" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.plantontology.org/amigo/go.cgi?action=query&view=query&search_constraint=terms&query=PO:0009004",
      "database" : "Plant Ontology Consortium Database",
      "local_id_syntax" : "^[0-9]{7}$",
      "example_id" : "PO:0009004",
      "generic_url" : "http://www.plantontology.org/",
      "entity_type" : "PO:0009012 ! plant structure development stage ",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PO",
      "url_syntax" : "http://www.plantontology.org/amigo/go.cgi?action=query&view=query&search_constraint=terms&query=PO:[example_id]",
      "datatype" : null
   },
   "isbn" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://my.linkbaton.com/get?lbCC=q&nC=q&genre=book&item=0781702534",
      "database" : "International Standard Book Number",
      "example_id" : "ISBN:0781702534",
      "generic_url" : "http://isbntools.com/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "ISBN",
      "url_syntax" : "http://my.linkbaton.com/get?lbCC=q&nC=q&genre=book&item=[example_id]",
      "datatype" : null
   },
   "cgd" : {
      "object" : "Identifier for CGD Loci",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.candidagenome.org/cgi-bin/locus.pl?dbid=CAL0005516",
      "database" : "Candida Genome Database",
      "local_id_syntax" : "^(CAL|CAF)[0-9]{7}$",
      "example_id" : "CGD:CAL0005516",
      "synonym" : "CGDID",
      "generic_url" : "http://www.candidagenome.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "CGD",
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/locus.pl?dbid=[example_id]",
      "datatype" : null
   },
   "ncbi_locus_tag" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "NCBI locus tag",
      "example_id" : "NCBI_locus_tag:CTN_0547",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "NCBI_locus_tag",
      "url_syntax" : null,
      "datatype" : null
   },
   "dictybase_gene_name" : {
      "object" : "Gene name",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://dictybase.org/gene/mlcE",
      "database" : "dictyBase",
      "example_id" : "dictyBase_gene_name:mlcE",
      "generic_url" : "http://dictybase.org",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "dictyBase_gene_name",
      "url_syntax" : "http://dictybase.org/gene/[example_id]",
      "datatype" : null
   },
   "cog" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "NCBI Clusters of Orthologous Groups",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/COG/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "COG",
      "url_syntax" : null,
      "datatype" : null
   },
   "dflat" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Developmental FunctionaL Annotation at Tufts",
      "generic_url" : "http://bcb.cs.tufts.edu/dflat/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "DFLAT",
      "url_syntax" : null,
      "datatype" : null
   },
   "mips_funcat" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://mips.gsf.de/cgi-bin/proj/funcatDB/search_advanced.pl?action=2&wert=11.02",
      "database" : "MIPS Functional Catalogue",
      "example_id" : "MIPS_funcat:11.02",
      "generic_url" : "http://mips.gsf.de/proj/funcatDB/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "MIPS_funcat",
      "url_syntax" : "http://mips.gsf.de/cgi-bin/proj/funcatDB/search_advanced.pl?action=2&wert=[example_id]",
      "datatype" : null
   },
   "superfamily" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://supfam.cs.bris.ac.uk/SUPERFAMILY/cgi-bin/scop.cgi?ipid=SSF51905",
      "description" : "A database of structural and functional protein annotations for completely sequenced genomes",
      "database" : "SUPERFAMILY protein annotation database",
      "example_id" : "SUPERFAMILY:51905",
      "generic_url" : "http://supfam.cs.bris.ac.uk/SUPERFAMILY/index.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "SUPERFAMILY",
      "url_syntax" : "http://supfam.cs.bris.ac.uk/SUPERFAMILY/cgi-bin/scop.cgi?ipid=SSF[example_id]",
      "datatype" : null
   },
   "ecocyc" : {
      "object" : "Pathway identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://biocyc.org/ECOLI/NEW-IMAGE?type=PATHWAY&object=P2-PWY",
      "database" : "Encyclopedia of E. coli metabolism",
      "local_id_syntax" : "^EG[0-9]{5}$",
      "example_id" : "EcoCyc:P2-PWY",
      "generic_url" : "http://ecocyc.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "EcoCyc",
      "url_syntax" : "http://biocyc.org/ECOLI/NEW-IMAGE?type=PATHWAY&object=[example_id]",
      "datatype" : null
   },
   "pr" : {
      "object" : "Identifer",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.proconsortium.org/cgi-bin/pro/entry_pro?id=PR:000025380",
      "database" : "Protein Ontology",
      "local_id_syntax" : "^[0-9]{9}$",
      "example_id" : "PR:000025380",
      "synonym" : "PRO",
      "generic_url" : "http://www.proconsortium.org/pro/pro.shtml",
      "entity_type" : "PR:000000001 ! protein ",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PR",
      "url_syntax" : "http://www.proconsortium.org/cgi-bin/pro/entry_pro?id=PR:[example_id]",
      "datatype" : null
   },
   "mgi" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.informatics.jax.org/accession/MGI:80863",
      "database" : "Mouse Genome Informatics",
      "local_id_syntax" : "^MGI:[0-9]{5,}$",
      "example_id" : "MGI:MGI:80863",
      "generic_url" : "http://www.informatics.jax.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "MGI",
      "url_syntax" : "http://www.informatics.jax.org/accession/[example_id]",
      "datatype" : null
   },
   "wikipedia" : {
      "object" : "Page Reference Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://en.wikipedia.org/wiki/Endoplasmic_reticulum",
      "database" : "Wikipedia",
      "example_id" : "Wikipedia:Endoplasmic_reticulum",
      "generic_url" : "http://en.wikipedia.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "Wikipedia",
      "url_syntax" : "http://en.wikipedia.org/wiki/[example_id]",
      "datatype" : null
   },
   "bfo" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://purl.obolibrary.org/obo/BFO_0000066",
      "description" : "An upper ontology used by Open Bio Ontologies (OBO) Foundry. BFO contains upper-level classes as well as core relations such as part_of (BFO_0000050)",
      "database" : "Basic Formal Ontology",
      "example_id" : "BFO:0000066",
      "generic_url" : "http://purl.obolibrary.org/obo/bfo",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "BFO",
      "url_syntax" : "http://purl.obolibrary.org/obo/BFO_[example_id]",
      "datatype" : null
   },
   "refgenome" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "GO Reference Genomes",
      "generic_url" : "http://www.geneontology.org/GO.refgenome.shtml",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "RefGenome",
      "url_syntax" : null,
      "datatype" : null
   },
   "subtilist" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Bacillus subtilis Genome Sequence Project",
      "example_id" : "SUBTILISTG:BG11384",
      "generic_url" : "http://genolist.pasteur.fr/SubtiList/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "SUBTILIST",
      "url_syntax" : null,
      "datatype" : null
   },
   "h-invdb_locus" : {
      "object" : "Cluster identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.h-invitational.jp/hinv/spsoup/locus_view?hix_id=HIX0014446",
      "database" : "H-invitational Database",
      "example_id" : "H-invDB_locus:HIX0014446",
      "generic_url" : "http://www.h-invitational.jp/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "H-invDB_locus",
      "url_syntax" : "http://www.h-invitational.jp/hinv/spsoup/locus_view?hix_id=[example_id]",
      "datatype" : null
   },
   "casgen" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Genus&id=1040",
      "database" : "Catalog of Fishes genus database",
      "example_id" : "CASGEN:1040",
      "synonym" : "CAS_GEN",
      "generic_url" : "http://research.calacademy.org/research/ichthyology/catalog/fishcatsearch.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "CASGEN",
      "url_syntax" : "http://research.calacademy.org/research/ichthyology/catalog/getname.asp?rank=Genus&id=[example_id]",
      "datatype" : null
   },
   "iuphar" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "International Union of Pharmacology",
      "generic_url" : "http://www.iuphar.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "IUPHAR",
      "url_syntax" : null,
      "datatype" : null
   },
   "interpro" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ebi.ac.uk/interpro/IEntry?ac=IPR002606",
      "database" : "InterPro database of protein domains and motifs",
      "local_id_syntax" : "^IPR\\d{6}$",
      "example_id" : "InterPro:IPR000001",
      "synonym" : "IPR",
      "generic_url" : "http://www.ebi.ac.uk/interpro/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "InterPro",
      "url_syntax" : "http://www.ebi.ac.uk/interpro/IEntry?ac=[example_id]",
      "datatype" : null
   },
   "ensemblfungi" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ensemblgenomes.org/id/YOR197W",
      "database" : "Ensembl Fungi, the Ensembl Genomes database for accessing fungal genome data",
      "example_id" : "EnsemblFungi:YOR197W",
      "generic_url" : "http://fungi.ensembl.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "EnsemblFungi",
      "url_syntax" : "http://www.ensemblgenomes.org/id/[example_ID]",
      "datatype" : null
   },
   "uniprotkb" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "local_id_syntax" : "^[A-Z][0-9][A-Z0-9]{3}[0-9]((-([0-9]+)|:PRO_[0-9]{10}))?$",
      "example_id" : "UniProtKB:P51587",
      "generic_url" : "http://www.uniprot.org",
      "entity_type" : "PR:000000001 ! protein ",
      "id" : null,
      "url_syntax" : "http://www.uniprot.org/uniprot/[example_id]",
      "name" : null,
      "url_example" : "http://www.uniprot.org/uniprot/P51587",
      "description" : "A central repository of protein sequence and function created by joining the information contained in Swiss-Prot, TrEMBL, and PIR database",
      "database" : "Universal Protein Knowledgebase",
      "synonym" : "UniProt",
      "fullname" : null,
      "abbreviation" : "UniProtKB",
      "datatype" : null
   },
   "jcvi_cmr" : {
      "object" : "Locus",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=VCA0557",
      "database" : "Comprehensive Microbial Resource at the J. Craig Venter Institute",
      "example_id" : "JCVI_CMR:VCA0557",
      "synonym" : "TIGR_CMR",
      "generic_url" : "http://cmr.jcvi.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "JCVI_CMR",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenePage.cgi?locus=[example_id]",
      "datatype" : null
   },
   "prow" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Protein Reviews on the Web",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/prow/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PROW",
      "url_syntax" : null,
      "datatype" : null
   },
   "wb" : {
      "object" : "Gene identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.wormbase.org/db/get?class=Gene;name=WBGene00003001",
      "database" : "WormBase database of nematode biology",
      "local_id_syntax" : "^WB(Gene|Var)[0-9]{8}$",
      "example_id" : "WB:WBGene00003001",
      "synonym" : "WormBase",
      "generic_url" : "http://www.wormbase.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "WB",
      "url_syntax" : "http://www.wormbase.org/db/gene/gene?name=[example_id]",
      "datatype" : null
   },
   "mtbbase" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Collection and Refinement of Physiological Data on Mycobacterium",
      "generic_url" : "http://www.ark.in-berlin.de/Site/MTBbase.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "MTBBASE",
      "url_syntax" : null,
      "datatype" : null
   },
   "taxon" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=3702",
      "database" : "NCBI Taxonomy",
      "example_id" : "taxon:7227",
      "synonym" : "ncbi_taxid",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Taxonomy/taxonomyhome.html/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "taxon",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=[example_id]",
      "datatype" : null
   },
   "uniparc" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.uniprot.org/uniparc/UPI000000000A",
      "description" : "A non-redundant archive of protein sequences extracted from Swiss-Prot, TrEMBL, PIR-PSD, EMBL, Ensembl, IPI, PDB, RefSeq, FlyBase, WormBase, European Patent Office, United States Patent and Trademark Office, and Japanese Patent Office",
      "database" : "UniProt Archive",
      "example_id" : "UniParc:UPI000000000A",
      "generic_url" : "http://www.uniprot.org/uniparc/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "UniParc",
      "url_syntax" : "http://www.uniprot.org/uniparc/[example_id]",
      "datatype" : null
   },
   "genbank" : {
      "object" : "Sequence accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=AA816246",
      "description" : "The NIH genetic sequence database, an annotated collection of all publicly available DNA sequences.",
      "database" : "GenBank",
      "local_id_syntax" : "^[A-Z]{2}[0-9]{6}$",
      "example_id" : "GB:AA816246",
      "synonym" : "GB",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/Genbank/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GenBank",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/viewer.fcgi?db=nucleotide&val=[example_id]",
      "datatype" : null
   },
   "gdb" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.gdb.org/gdb-bin/genera/accno?accessionNum=GDB:306600",
      "database" : "Human Genome Database",
      "example_id" : "GDB:306600",
      "generic_url" : "http://www.gdb.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GDB",
      "url_syntax" : "http://www.gdb.org/gdb-bin/genera/accno?accessionNum=GDB:[example_id]",
      "datatype" : null
   },
   "ensembl_proteinid" : {
      "object" : "Protein identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ensembl.org/id/ENSP00000361027",
      "database" : "Ensembl database of automatically annotated genomic data",
      "local_id_syntax" : "^ENSP[0-9]{9,16}$",
      "example_id" : "ENSEMBL_ProteinID:ENSP00000361027",
      "generic_url" : "http://www.ensembl.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "ENSEMBL_ProteinID",
      "url_syntax" : "http://www.ensembl.org/id/[example_id]",
      "datatype" : null
   },
   "sgd_ref" : {
      "object" : "Literature Reference Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://db.yeastgenome.org/cgi-bin/reference/reference.pl?dbid=S000049602",
      "database" : "Saccharomyces Genome Database",
      "example_id" : "SGD_REF:S000049602",
      "generic_url" : "http://www.yeastgenome.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "SGD_REF",
      "url_syntax" : "http://db.yeastgenome.org/cgi-bin/reference/reference.pl?dbid=[example_id]",
      "datatype" : null
   },
   "rhea" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ebi.ac.uk/rhea/reaction.xhtml?id=25811",
      "description" : "Rhea is a freely available, manually annotated database of chemical reactions created in collaboration with the Swiss Institute of Bioinformatics (SIB).",
      "database" : "Rhea, the Annotated Reactions Database",
      "example_id" : "RHEA:25811",
      "generic_url" : "http://www.ebi.ac.uk/rhea/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "RHEA",
      "url_syntax" : "http://www.ebi.ac.uk/rhea/reaction.xhtml?id=[example_id]",
      "datatype" : null
   },
   "vmd" : {
      "object" : "Gene identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://vmd.vbi.vt.edu/cgi-bin/browse/browserDetail_new.cgi?gene_id=109198",
      "database" : "Virginia Bioinformatics Institute Microbial Database",
      "example_id" : "VMD:109198",
      "generic_url" : "http://phytophthora.vbi.vt.edu",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "VMD",
      "url_syntax" : "http://vmd.vbi.vt.edu/cgi-bin/browse/browserDetail_new.cgi?gene_id=[example_id]",
      "datatype" : null
   },
   "eck" : {
      "object" : "ECK accession (E. coli K-12 gene identifier)",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ecogene.org/geneInfo.php?eck_id=ECK3746",
      "database" : "EcoGene Database of Escherichia coli Sequence and Function",
      "local_id_syntax" : "^ECK[0-9]{4}$",
      "example_id" : "ECK:ECK3746",
      "generic_url" : "http://www.ecogene.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "ECK",
      "url_syntax" : "http://www.ecogene.org/geneInfo.php?eck_id=[example_id]",
      "datatype" : null
   },
   "eco" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Evidence Code ontology",
      "local_id_syntax" : "^\\d{7}$",
      "example_id" : "ECO:0000002",
      "generic_url" : "http://www.geneontology.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "ECO",
      "url_syntax" : null,
      "datatype" : null
   },
   "jcvi_genprop" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenomePropDefinition.cgi?prop_acc=GenProp0120",
      "database" : "Genome Properties database at the J. Craig Venter Institute",
      "local_id_syntax" : "^GenProp[0-9]{4}$",
      "example_id" : "JCVI_GenProp:GenProp0120",
      "synonym" : "TIGR_GenProp",
      "generic_url" : "http://cmr.jcvi.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "JCVI_GenProp",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/shared/GenomePropDefinition.cgi?prop_acc=[example_id]",
      "datatype" : null
   },
   "cgd_locus" : {
      "object" : "Gene name (gene symbol in mammalian nomenclature)",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.candidagenome.org/cgi-bin/locus.pl?locus=HWP1",
      "database" : "Candida Genome Database",
      "example_id" : "CGD_LOCUS:HWP1",
      "generic_url" : "http://www.candidagenome.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "CGD_LOCUS",
      "url_syntax" : "http://www.candidagenome.org/cgi-bin/locus.pl?locus=[example_id]",
      "datatype" : null
   },
   "so" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://song.sourceforge.net/SOterm_tables.html#SO:0000195",
      "database" : "Sequence Ontology",
      "local_id_syntax" : "^\\d{7}$",
      "example_id" : "SO:0000195",
      "generic_url" : "http://sequenceontology.org/",
      "entity_type" : "SO:0000400 ! sequence attribute ",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "SO",
      "url_syntax" : "http://song.sourceforge.net/SOterm_tables.html#SO:[example_id]",
      "datatype" : null
   },
   "genedb_gmorsitans" : {
      "object" : "Gene identifier",
      "shorthand_name" : "Tsetse",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.genedb.org/genedb/Search?organism=glossina&name=Gmm-0142",
      "database" : "Glossina morsitans GeneDB",
      "example_id" : "GeneDB_Gmorsitans:Gmm-0142",
      "generic_url" : "http://www.genedb.org/genedb/glossina/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "GeneDB_Gmorsitans",
      "url_syntax" : "http://www.genedb.org/genedb/Search?organism=glossina&name=[example_id]",
      "datatype" : null
   },
   "pombase" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.pombase.org/spombe/result/SPBC11B10.09",
      "database" : "PomBase",
      "local_id_syntax" : "^S\\w+(\\.)?\\w+(\\.)?$",
      "example_id" : "PomBase:SPBC11B10.09",
      "generic_url" : "http://www.pombase.org/",
      "entity_type" : "SO:0000704 ! gene ",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PomBase",
      "url_syntax" : "http://www.pombase.org/spombe/result/[example_id]",
      "datatype" : null
   },
   "psi-mod" : {
      "object" : "Protein modification identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ebi.ac.uk/ontology-lookup/?termId=MOD:00219",
      "database" : "Proteomics Standards Initiative protein modification ontology",
      "example_id" : "MOD:00219",
      "synonym" : "MOD",
      "generic_url" : "http://psidev.sourceforge.net/mod/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PSI-MOD",
      "url_syntax" : "http://www.ebi.ac.uk/ontology-lookup/?termId=MOD:[example_id]",
      "datatype" : null
   },
   "rfam" : {
      "object" : "accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://rfam.sanger.ac.uk/family/RF00012",
      "database" : "Rfam database of RNA families",
      "example_id" : "Rfam:RF00012",
      "generic_url" : "http://rfam.sanger.ac.uk/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "Rfam",
      "url_syntax" : "http://rfam.sanger.ac.uk/family/[example_id]",
      "datatype" : null
   },
   "ppi" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Pseudomonas syringae community annotation project",
      "generic_url" : "http://genome.pseudomonas-syringae.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PPI",
      "url_syntax" : null,
      "datatype" : null
   },
   "reactome" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID=REACT_604",
      "database" : "Reactome - a curated knowledgebase of biological pathways",
      "example_id" : "Reactome:REACT_604",
      "generic_url" : "http://www.reactome.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "Reactome",
      "url_syntax" : "http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID=[example_id]",
      "datatype" : null
   },
   "wp" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.wormbase.org/db/get?class=Protein;name=WP:CE15104",
      "database" : "Wormpep database of proteins of C. elegans",
      "example_id" : "WP:CE25104",
      "synonym" : "Wormpep",
      "generic_url" : "http://www.wormbase.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "WP",
      "url_syntax" : "http://www.wormbase.org/db/get?class=Protein;name=WP:[example_id]",
      "datatype" : null
   },
   "subtilistg" : {
      "object" : "Gene symbol",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Bacillus subtilis Genome Sequence Project",
      "example_id" : "SUBTILISTG:accC",
      "generic_url" : "http://genolist.pasteur.fr/SubtiList/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "SUBTILISTG",
      "url_syntax" : null,
      "datatype" : null
   },
   "ddanat" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Dictyostelium discoideum anatomy",
      "example_id" : "DDANAT:0000068",
      "generic_url" : "http://dictybase.org/Dicty_Info/dicty_anatomy_ontology.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "DDANAT",
      "url_syntax" : null,
      "datatype" : null
   },
   "ntnu_sb" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Norwegian University of Science and Technology, Systems Biology team",
      "generic_url" : "http://www.ntnu.edu/nt/systemsbiology",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "NTNU_SB",
      "url_syntax" : null,
      "datatype" : null
   },
   "kegg_enzyme" : {
      "object" : "Enzyme Commission ID, as stored in KEGG",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.genome.jp/dbget-bin/www_bget?ec:2.1.1.4",
      "database" : "KEGG Enzyme Database",
      "local_id_syntax" : "^\\d(\\.\\d{1,2}){2}\\.\\d{1,3}$",
      "example_id" : "KEGG_ENZYME:2.1.1.4",
      "generic_url" : "http://www.genome.jp/dbget-bin/www_bfind?enzyme",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "KEGG_ENZYME",
      "url_syntax" : "http://www.genome.jp/dbget-bin/www_bget?ec:[example_id]",
      "datatype" : null
   },
   "jcvi_egad" : {
      "object" : "Accession",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://cmr.jcvi.org/cgi-bin/CMR/EgadSearch.cgi?search_string=74462",
      "database" : "EGAD database at the J. Craig Venter Institute",
      "example_id" : "JCVI_EGAD:74462",
      "synonym" : "TIGR_EGAD",
      "generic_url" : "http://cmr.jcvi.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "JCVI_EGAD",
      "url_syntax" : "http://cmr.jcvi.org/cgi-bin/CMR/EgadSearch.cgi?search_string=[example_id]",
      "datatype" : null
   },
   "pubchem_substance" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pcsubstance&term=4594",
      "database" : "NCBI PubChem database of chemical substances",
      "local_id_syntax" : "^[0-9]{4,}$",
      "example_id" : "PubChem_Substance:4594",
      "generic_url" : "http://pubchem.ncbi.nlm.nih.gov/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "PubChem_Substance",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/entrez/query.fcgi?CMD=search&DB=pcsubstance&term=[example_id]",
      "datatype" : null
   },
   "multifun" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "MultiFun cell function assignment schema",
      "generic_url" : "http://genprotec.mbl.edu/files/MultiFun.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "MultiFun",
      "url_syntax" : null,
      "datatype" : null
   },
   "ipi" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "International Protein Index",
      "example_id" : "IPI:IPI00000005.1",
      "generic_url" : "http://www.ebi.ac.uk/IPI/IPIhelp.html",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "IPI",
      "url_syntax" : null,
      "datatype" : null
   },
   "vz" : {
      "object" : "Page Reference Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://viralzone.expasy.org/all_by_protein/957.html",
      "database" : "ViralZone",
      "example_id" : "VZ:957",
      "generic_url" : "http://viralzone.expasy.org/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "VZ",
      "url_syntax" : "http://viralzone.expasy.org/all_by_protein/[example_id].html",
      "datatype" : null
   },
   "ncbi_gene" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=4771",
      "database" : "NCBI Gene",
      "local_id_syntax" : "^\\d+$",
      "example_id" : "NCBI_Gene:4771",
      "synonym" : "LocusID",
      "generic_url" : "http://www.ncbi.nlm.nih.gov/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "NCBI_Gene",
      "url_syntax" : "http://www.ncbi.nlm.nih.gov/sites/entrez?cmd=Retrieve&db=gene&list_uids=[example_id]",
      "datatype" : null
   },
   "hamap" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://us.expasy.org/unirules/MF_00031",
      "database" : "High-quality Automated and Manual Annotation of microbial Proteomes",
      "example_id" : "HAMAP:MF_00031",
      "generic_url" : "http://us.expasy.org/sprot/hamap/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "HAMAP",
      "url_syntax" : "http://us.expasy.org/unirules/[example_id]",
      "datatype" : null
   },
   "aracyc" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.arabidopsis.org:1555/ARA/NEW-IMAGE?type=NIL&object=PWYQT-62",
      "database" : "AraCyc metabolic pathway database for Arabidopsis thaliana",
      "example_id" : "AraCyc:PWYQT-62",
      "generic_url" : "http://www.arabidopsis.org/biocyc/index.jsp",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "AraCyc",
      "url_syntax" : "http://www.arabidopsis.org:1555/ARA/NEW-IMAGE?type=NIL&object=[example_id]",
      "datatype" : null
   },
   "broad" : {
      "uri_prefix" : null,
      "name" : null,
      "url_example" : null,
      "database" : "Broad Institute",
      "generic_url" : "http://www.broad.mit.edu/",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "Broad",
      "url_syntax" : null,
      "datatype" : null
   },
   "unipathway" : {
      "object" : "Identifier",
      "uri_prefix" : null,
      "name" : null,
      "url_example" : "http://www.grenoble.prabi.fr/obiwarehouse/unipathway/upa?upid=UPA00155",
      "description" : "UniPathway is a a metabolic door to UniProtKB/Swiss-Prot, a curated resource of metabolic pathways for the UniProtKB/Swiss-Prot knowledgebase.",
      "database" : "UniPathway",
      "example_id" : "UniPathway:UPA00155",
      "generic_url" : "http://www.grenoble.prabi.fr/obiwarehouse/unipathway",
      "fullname" : null,
      "id" : null,
      "abbreviation" : "UniPathway",
      "url_syntax" : "http://www.grenoble.prabi.fr/obiwarehouse/unipathway/upa?upid=[example_id]",
      "datatype" : null
   }
};
/*
 * Package: statistics.js
 * 
 * Namespace: amigo.data.statistics
 * 
 * This package was automatically created during an AmiGO 2 installation.
 * 
 * Purpose: Useful numbers about the current data in the store.
 * 
 * Requirements: amigo.js for bbop.amigo namespace.
 * 
 * NOTE: This file is generated dynamically at installation time.
 *       Hard to work with unit tests--hope it's not too bad.
 *       Want to keep this real simple.
 */

// Module and namespace checking.
bbop.core.require('bbop', 'core');
bbop.core.namespace('amigo', 'data', 'statistics');

/*
 * Variable: annotation_evidence
 * 
 * TBD
 */
amigo.data.statistics.annotation_source = [["UniProtKB", 648243], ["InterPro", 538277], ["ENSEMBL", 219415], ["TIGR", 166869], ["MGI", 144434], ["CGD", 117773], ["AspGD", 116630], ["RGD", 87770], ["ZFIN", 86208], ["FlyBase", 78621], ["JCVI", 78268], ["TAIR", 70190], ["WB", 67370], ["GR", 50329], ["SGD", 43471], ["PAMGO_MGG", 42572], ["PomBase", 31755], ["MTBBASE", 25609], ["Reactome", 20891], ["dictyBase", 20571], ["RefGenome", 19566], ["GOC", 15382], ["UniPathway", 15241], ["BHF-UCL", 15002], ["GeneDB_Pfalciparum", 8928], ["IntAct", 6394], ["EcoCyc", 6159], ["PINC", 5609], ["PseudoCAP", 4394], ["HPA", 3604], ["GeneDB_Tbrucei", 3553], ["HGNC", 2778], ["EcoliWiki", 2323], ["EnsemblPlants/Gramene", 2236], ["AgBase", 2109], ["GeneDB_Lmajor", 903], ["PAMGO", 647], ["SGN", 562], ["DFLAT", 444], ["ASAP", 296], ["GONUTS", 284], ["PAMGO_GAT", 260], ["LIFEdb", 206], ["REFGENOME", 97], ["PAMGO_VMD", 75], ["EnsemblFungi", 60], ["Roslin_Institute", 54], ["GDB", 28], ["WormBase", 26], ["Eurofung", 5]];

/*
 * Variable: annotation_source
 * 
 * TBD
 */
amigo.data.statistics.annotation_evidence = [["similarity evidence", 398219], ["experimental evidence", 350498], ["curator inference", 350258], ["combinatorial evidence", 66446], ["author statement", 65394], ["genomic context evidence", 807]];

/*
 * Variable: annotation_overview
 * 
 * TBD
 */
amigo.data.statistics.annotation_overview = [["Source", "similarity evidence", "experimental evidence", "curator inference", "author statement", "combinatorial evidence", "genomic context evidence", "biological system reconstruction", "imported information"], ["dictyBase", 9293, 4317, 6478, 483, 0, 0, 0, 0], ["EcoCyc", 415, 5548, 1, 40, 142, 0, 0, 0], ["FlyBase", 13935, 30400, 6973, 12954, 19, 18, 0, 0], ["MGI", 52964, 56237, 33094, 2004, 135, 0, 0, 0], ["PomBase", 10194, 8795, 4310, 1173, 727, 0, 0, 0], ["RGD", 66561, 15031, 2107, 1780, 3, 0, 0, 0], ["SGD", 3389, 33124, 4591, 2366, 1, 0, 0, 0], ["TAIR", 11078, 16600, 8453, 1664, 14752, 0, 0, 0], ["WB", 858, 32613, 59, 145, 1, 0, 0, 0], ["ZFIN", 505, 10417, 11076, 127, 0, 0, 0, 0]];
