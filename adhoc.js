// Not sure why Prototype doesn't include this...
Event.KEY_CONTROL = 17;
Event.KEY_COMMAND1 = 91;
Event.KEY_COMMAND2 = 93;
Event.KEY_COMMAND3 = 224;

// Not sure why JavaScript doesn't include this...
String.prototype.ltrim = function(s){ return this.replace(new RegExp("^"+s+"+", "")); }
String.prototype.rtrim = function(s){ return this.replace(new RegExp(s+"+$", "")); }

// Set up everything only after the page loads
Event.observe(window, 'load', function(){
	var adhoc = {};

	// Certain class globals
	adhoc.languageHighlightClasses = {
		'asp.net':			'aspnet'
		,'c':				'c'
		,'c++':				'cpp'
		,'c#':				'csharp'
		,'clike':			'clike'
		,'coffeescript':	'coffeescript'
		,'golang':			'go'
		,'html':			'markup'
		,'http':			'http'
		,'java':			'java'
		,'javascript':		'javascript'
		,'markup':			'markup'
		,'php':				'php'
		,'python':			'python'
		,'ruby':			'ruby'
		,'sass':			'scss'
		,'scala':			'scala'
		,'shell':			'bash'
		,'sql':				'sql'
	};
	adhoc.settings = {
		dbg: false
		,colorScheme: 'light'
		,showNullNodes: true
		,labelConnectors: 1
		,projectId: 0
		,projectName: 'New Project'
		,username: null
		,password: null
		,remember: false
	};
	adhoc.canvas = null;
	adhoc.selectedNode = null;
	adhoc.textColor = '#000000';
	adhoc.textColorDark = '#EEEEEE';
	adhoc.display_scale = 1.0;
	adhoc.display_x = 0;
	adhoc.display_y = 0;
	adhoc.lastId = 0;
	adhoc.alternateKeys = false;
	adhoc.history = null;
	adhoc.movingNode = null;
	adhoc.movingNodeTimeout = null;

	// Hold the autocomplete listener so we can remove it later... javascript
	adhoc.autocompleteListener = null;

	// AST node super-types
	adhoc.nodeTypes = {
		TYPE_NULL:	0
		,ACTION:	1
		,GROUP:		2
		,CONTROL:	3
		,OPERATOR:	4
		,ASSIGNMENT:5
		,VARIABLE:	6
		,LITERAL:	7
	};
	// AST node sub-types
	adhoc.nodeWhich = {
		WHICH_NULL:			0
		,ACTION_DEFIN:		1
		,ACTION_CALL:		2
		,GROUP_SERIAL:		3
		,CONTROL_IF:		4
		,CONTROL_LOOP:		5
		,CONTROL_SWITCH:	6
		,CONTROL_CASE:		7
		,CONTROL_FORK:		8
		,CONTROL_CNTNU:		9
		,CONTROL_BREAK:		10
		,CONTROL_RETRN:		11
		,OPERATOR_PLUS:		12
		,OPERATOR_MINUS:	13
		,OPERATOR_TIMES:	14
		,OPERATOR_DIVBY:	15
		,OPERATOR_MOD:		16
		,OPERATOR_EXP:		17
		,OPERATOR_OR:		18
		,OPERATOR_AND:		19
		,OPERATOR_NOT:		20
		,OPERATOR_EQUIV:	21
		,OPERATOR_GRTTN:	22
		,OPERATOR_LESTN:	23
		,OPERATOR_GRTEQ:	24
		,OPERATOR_LESEQ:	25
		,OPERATOR_NOTEQ:	26
		,OPERATOR_ARIND:	27
		,OPERATOR_TRNIF:	28
		,ASSIGNMENT_INCPR:	29
		,ASSIGNMENT_INCPS:	30
		,ASSIGNMENT_DECPR:	31
		,ASSIGNMENT_DECPS:	32
		,ASSIGNMENT_NEGPR:	33
		,ASSIGNMENT_NEGPS:	34
		,ASSIGNMENT_EQUAL:	35
		,ASSIGNMENT_PLUS:	36
		,ASSIGNMENT_MINUS:	37
		,ASSIGNMENT_TIMES:	38
		,ASSIGNMENT_DIVBY:	39
		,ASSIGNMENT_MOD:	40
		,ASSIGNMENT_EXP:	41
		,ASSIGNMENT_OR:		42
		,ASSIGNMENT_AND:	43
		,VARIABLE_ASIGN:	44
		,VARIABLE_EVAL:		45
		,LITERAL_BOOL:		46
		,LITERAL_INT:		47
		,LITERAL_FLOAT:		48
		,LITERAL_STRNG:		49
		,LITERAL_ARRAY:		50
		,LITERAL_HASH:		51
		,LITERAL_STRCT:		52
	};
	// AST node child connection types
	adhoc.nodeChildType = {
		CHILD_NULL:		0
		,STATEMENT:		1
		,EXPRESSION:	2
		,INITIALIZATION:3
		,CONDITION:		4
		,CASE:			5
		,PARAMETER:		6
		,ARGUMENT:		7
		,PARENT:		8
		,CHILD:			9
		,MEMBER:		10
		,IF:			11
		,ELSE:			12
		,STORAGE:		13
	};
	// AST node type names
	adhoc.nodeTypeNames = [
		'Null'
		,'Action'
		,'Group'
		,'Control'
		,'Operator'
		,'Assignment'
		,'Variable'
		,'Literal'
	];
	// AST node sub-type names
	adhoc.nodeWhichNames = [
		[ // NULL
			['Null', '']
		]
		,[ // ACTION
			['Define Action', '']
			,['Call Action', '']
		]
		,[ // GROUP
			['Serial Group', '']
		]
		,[ // CONTROL
			['If', 'If']
			,['Loop', 'Loop']
			,['Switch', 'Switch']
			,['Case', 'Case']
			,['Fork', 'Fork']
			,['Continue', 'Continue']
			,['Break', 'Break']
			,['Return', 'Return']
		]
		,[ // OPERATOR
			['Plus', '+']
			,['Minus', '-']
			,['Times', '*']
			,['Divided By', '&#247;']
			,['Modulo', '%']
			,['Raised To', '^']
			,['Or', '||']
			,['And', '&&']
			,['Not', '!']
			,['Equivalent To', '==']
			,['Greater Than', '>']
			,['Less Than', '<']
			,['Greater Or Equal To', '>=']
			,['Less Or Equal To', '<=']
			,['Not Equal To', '!=']
			,['Array Index', '[]']
			,['Ternary If', '? :']
		]
		,[ // ASSIGNMENT
			['Increment', '++']
			,['Increment', '++']
			,['Decrement', '--']
			,['Decrement', '--']
			,['Invert', '!!']
			,['Invert', '!!']
			,['Assign', '=']
			,['Add', '+=']
			,['Subtract', '-=']
			,['Multiply By', '*=']
			,['Divide By', '&#247;=']
			,['Modulo By', '%=']
			,['Raise To', '^=']
			,['Disjoin With', '||=']
			,['Conjoin With', '&&=']
		]
		,[ // VARIABLE
			['Variable', '']
			,['Variable', '']
		]
		,[ // LITERAL
			['Boolean', '']
			,['Integer', '']
			,['Float', '']
			,['String', '']
			,['Array', '']
			,['Hash', '']
			,['Struct', '']
		]
	];
	// AST node sub-type indices
	adhoc.nodeWhichIndices = [
		[0,0]
		,[1,0],[1,1]
		,[2,0]
		,[3,0],[3,1],[3,2],[3,3],[3,4],[3,5],[3,6],[3,7]
		,[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6],[4,7],[4,8],[4,9],[4,10],[4,11],[4,12],[4,13],[4,14],[4,15],[4,16]
		,[5,0],[5,1],[5,2],[5,3],[5,4],[5,5],[5,6],[5,7],[5,8],[5,9],[5,10],[5,11],[5,12],[5,13],[5,14]
		,[6,0],[6,1]
		,[7,0],[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]
	];
	// AST node child connection type names
	adhoc.nodeChildTypeInfo = [
		{label: 'Null'
			,useLabel: false
			,nodeTypes: []
			,nodeNotWhich: []
		}
		,{label: 'Statement'
			,useLabel: false
			,nodeTypes: [
				adhoc.nodeTypes.ACTION
				,adhoc.nodeTypes.GROUP
				,adhoc.nodeTypes.CONTROL
				,adhoc.nodeTypes.ASSIGNMENT
			]
			,nodeNotWhich: [
				adhoc.nodeWhich.CONTROL_CASE
			]
		}
		,{label: 'Expression'
			,useLabel: false
			,nodeTypes: [
				adhoc.nodeTypes.ACTION
				,adhoc.nodeTypes.OPERATOR
				,adhoc.nodeTypes.ASSIGNMENT
				,adhoc.nodeTypes.VARIABLE
				,adhoc.nodeTypes.LITERAL
			]
			,nodeNotWhich: [
				adhoc.nodeWhich.VARIABLE_ASIGN
			]
		}
		,{label: 'Initialization'
			,useLabel: true
			,nodeTypes: [
				,adhoc.nodeTypes.VARIABLE
			]
			,nodeNotWhich: [
				adhoc.nodeWhich.VARIABLE_EVAL
			]
		}
		,{label: 'Condition'
			,useLabel: true
			,nodeTypes: [
				adhoc.nodeTypes.ACTION
				,adhoc.nodeTypes.OPERATOR
				,adhoc.nodeTypes.ASSIGNMENT
				,adhoc.nodeTypes.VARIABLE
				,adhoc.nodeTypes.LITERAL
			]
			,nodeNotWhich: [
				adhoc.nodeWhich.VARIABLE_ASIGN
			]
		}
		,{label: 'Case'
			,useLabel: false
			,nodeTypes: [
				adhoc.nodeTypes.ACTION
				,adhoc.nodeTypes.OPERATOR
				,adhoc.nodeTypes.ASSIGNMENT
				,adhoc.nodeTypes.VARIABLE
				,adhoc.nodeTypes.LITERAL
			]
			,nodeNotWhich: [
				adhoc.nodeWhich.VARIABLE_ASIGN
			]
		}
		,{label: 'Parameter'
			,useLabel: false
			,nodeTypes: [
				adhoc.nodeTypes.VARIABLE
			]
			,nodeNotWhich: [
				adhoc.nodeWhich.VARIABLE_EVAL
			]
		}
		,{label: 'Argument'
			,useLabel: false
			,nodeTypes: [
				adhoc.nodeTypes.ACTION
				,adhoc.nodeTypes.OPERATOR
				,adhoc.nodeTypes.ASSIGNMENT
				,adhoc.nodeTypes.VARIABLE
				,adhoc.nodeTypes.LITERAL
			]
			,nodeNotWhich: [
				adhoc.nodeWhich.VARIABLE_ASIGN
			]
		}
		,{label: 'Parent'
			,useLabel: true
			,nodeTypes: [
				adhoc.nodeTypes.ACTION
				,adhoc.nodeTypes.GROUP
				,adhoc.nodeTypes.CONTROL
				,adhoc.nodeTypes.ASSIGNMENT
			]
			,nodeNotWhich: [
				adhoc.nodeWhich.CONTROL_CASE
			]
		}
		,{label: 'Child'
			,useLabel: true
			,nodeTypes: [
				adhoc.nodeTypes.ACTION
				,adhoc.nodeTypes.GROUP
				,adhoc.nodeTypes.CONTROL
				,adhoc.nodeTypes.ASSIGNMENT
			]
			,nodeNotWhich: [
				adhoc.nodeWhich.CONTROL_CASE
			]
		}
		,{label: 'Member'
			,useLabel: true
			,nodeTypes: [
				adhoc.nodeTypes.ACTION
				,adhoc.nodeTypes.OPERATOR
				,adhoc.nodeTypes.ASSIGNMENT
				,adhoc.nodeTypes.VARIABLE
				,adhoc.nodeTypes.LITERAL
			]
			,nodeNotWhich: [
				adhoc.nodeWhich.VARIABLE_ASIGN
			]
		}
		,{label: 'If (true)'
			,useLabel: true
			,nodeTypes: [
				adhoc.nodeTypes.ACTION
				,adhoc.nodeTypes.GROUP
				,adhoc.nodeTypes.CONTROL
				,adhoc.nodeTypes.ASSIGNMENT
			]
			,nodeNotWhich: [
				adhoc.nodeWhich.CONTROL_CASE
			]
		}
		,{label: 'Else (false)'
			,useLabel: true
			,nodeTypes: [
				adhoc.nodeTypes.ACTION
				,adhoc.nodeTypes.GROUP
				,adhoc.nodeTypes.CONTROL
				,adhoc.nodeTypes.ASSIGNMENT
			]
			,nodeNotWhich: [
				adhoc.nodeWhich.CONTROL_CASE
			]
		}
		,{label: 'Store'
			,useLabel: false
			,nodeTypes: [
				adhoc.nodeTypes.VARIABLE
			]
			,nodeNotWhich: [
				adhoc.nodeWhich.VARIABLE_EVAL
			]
		}
	];
	// Define the accepted child types of each type/which
	adhoc.nodeWhichChildren = [
		[ // NULL
			[ // WHICH_NULL
			]
		]
		,[ // ACTION
			[ // ACTION_DEFIN
				{
					childType: adhoc.nodeChildType.PARAMETER
					,min: 0
					,max: null
				},{
					childType: adhoc.nodeChildType.STATEMENT
					,min: 1
					,max: null
				}
			]
			,[ // ACTION_CALL
				{
					childType: adhoc.nodeChildType.ARGUMENT
					,min: 0
					,max: null
				}
			]
		]
		,[ // GROUP
			[ // GROUP_SERIAL
				{
					childType: adhoc.nodeChildType.STATEMENT
					,min: 1
					,max: null
				}
			]
		]
		,[ // CONTROL
			[ // CONTROL_IF
				{
					childType: adhoc.nodeChildType.CONDITION
					,min: 1
					,max: 1
				},{
					childType: adhoc.nodeChildType.IF
					,min: 1
					,max: null
				},{
					childType: adhoc.nodeChildType.ELSE
					,min: 0
					,max: null
				}
			]
			,[ // CONTROL_LOOP
				{
					childType: adhoc.nodeChildType.INITIALIZATION
					,min: 1
					,max: 1
				},{
					childType: adhoc.nodeChildType.CONDITION
					,min: 1
					,max: 1
				},{
					childType: adhoc.nodeChildType.STATEMENT
					,min: 1
					,max: null
				}
			]
			,[ // CONTROL_SWITCH
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 1
					,max: 1
				},{
					childType: adhoc.nodeChildType.CASE
					,min: 1
					,max: null
				}
			]
			,[ // CONTROL_CASE
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 1
					,max: 1
				},{
					childType: adhoc.nodeChildType.STATEMENT
					,min: 0
					,max: null
				}
			]
			,[ // CONTROL_FORK
				{
					childType: adhoc.nodeChildType.INITIALIZATION
					,min: 0
					,max: 1
				},{
					childType: adhoc.nodeChildType.PARENT
					,min: 1
					,max: 1
				},{
					childType: adhoc.nodeChildType.CHILD
					,min: 1
					,max: 1
				}
			]
			,[ // CONTROL_CNTNU
			]
			,[ // CONTROL_BREAK
			]
			,[ // CONTROL_RETRN
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 0
					,max: 1
				}
			]
		]
		,[ // OPERATOR
			[ // OPERATOR_PLUS
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 2
					,max: 2
				}
			]
			,[ // OPERATOR_MINUS
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 2
					,max: 2
				}
			]
			,[ // OPERATOR_TIMES
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 2
					,max: 2
				}
			]
			,[ // OPERATOR_DIVBY
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 2
					,max: 2
				}
			]
			,[ // OPERATOR_MOD
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 2
					,max: 2
				}
			]
			,[ // OPERATOR_EXP
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 2
					,max: 2
				}
			]
			,[ // OPERATOR_OR
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 2
					,max: 2
				}
			]
			,[ // OPERATOR_AND
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 2
					,max: 2
				}
			]
			,[ // OPERATOR_NOT
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 1
					,max: 1
				}
			]
			,[ // OPERATOR_EQUIV
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 2
					,max: 2
				}
			]
			,[ // OPERATOR_GRTTN
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 2
					,max: 2
				}
			]
			,[ // OPERATOR_LESTN
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 2
					,max: 2
				}
			]
			,[ // OPERATOR_GRTEQ
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 2
					,max: 2
				}
			]
			,[ // OPERATOR_LESEQ
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 2
					,max: 2
				}
			]
			,[ // OPERATOR_NOTEQ
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 2
					,max: 2
				}
			]
			,[ // OPERATOR_ARIND
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 2
					,max: 2
				}
			]
			,[ // OPERATOR_TRNIF
				{
					childType: adhoc.nodeChildType.CONDITION
					,min: 1
					,max: 1
				},{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 2
					,max: 2
				}
			]
		]
		,[ // ASSIGNMENT
			[ // ASSIGNMENT_INCPR
				{
					childType: adhoc.nodeChildType.STORAGE
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_INCPS
				{
					childType: adhoc.nodeChildType.STORAGE
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_DECPR
				{
					childType: adhoc.nodeChildType.STORAGE
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_DECPS
				{
					childType: adhoc.nodeChildType.STORAGE
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_NEGPR
				{
					childType: adhoc.nodeChildType.STORAGE
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_NEGPS
				{
					childType: adhoc.nodeChildType.STORAGE
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_EQUAL
				{
					childType: adhoc.nodeChildType.STORAGE
					,min: 1
					,max: 1
				},{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_PLUS
				{
					childType: adhoc.nodeChildType.STORAGE
					,min: 1
					,max: 1
				},{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_MINUS
				{
					childType: adhoc.nodeChildType.STORAGE
					,min: 1
					,max: 1
				},{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_TIMES
				{
					childType: adhoc.nodeChildType.STORAGE
					,min: 1
					,max: 1
				},{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_DIVBY
				{
					childType: adhoc.nodeChildType.STORAGE
					,min: 1
					,max: 1
				},{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_MOD
				{
					childType: adhoc.nodeChildType.STORAGE
					,min: 1
					,max: 1
				},{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_EXP
				{
					childType: adhoc.nodeChildType.STORAGE
					,min: 1
					,max: 1
				},{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_OR
				{
					childType: adhoc.nodeChildType.STORAGE
					,min: 1
					,max: 1
				},{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_AND
				{
					childType: adhoc.nodeChildType.STORAGE
					,min: 1
					,max: 1
				},{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 1
					,max: 1
				}
			]
		]
		,[ // VARIABLE
			[ // VARIABLE_ASIGN
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 1
					,max: 1
				}
			]
			,[ // VARIABLE_EVAL
			]
		]
		,[ // LITERAL
			[ // LITERAL_BOOL
			]
			,[ // LITERAL_INT
			]
			,[ // LITERAL_FLOAT
			]
			,[ // LITERAL_STRNG
			]
			,[ // LITERAL_ARRAY
				{
					childType: adhoc.nodeChildType.MEMBER
					,min: 0
					,max: null
				}
			]
			,[ // LITERAL_HASH
				{
					childType: adhoc.nodeChildType.MEMBER
					,min: 0
					,max: null
				}
			]
			,[ // LITERAL_STRCT
				{
					childType: adhoc.nodeChildType.MEMBER
					,min: 0
					,max: null
				}
			]
		]
	];
	// List of system actions that ADHOC supports
	adhoc.systemActions = [
		{
			package: 'system'
			,name: 'print'
			,argc: -1
		}
		,{
			package: 'system'
			,name: 'cat'
			,argc: -1
		}
	];
	// List of user-defined actions
	adhoc.registeredActions = [];
	// List of all nodes
	adhoc.allNodes = [];

	// Convert an int to a 3-byte string
	adhoc.intTo3Byte = function(i){
		var out = String.fromCharCode(i%256);
		i >>= 8;
		out = String.fromCharCode(i%256) + out;
		i >>= 8;
		return String.fromCharCode(i%256) + out;
	}
	// Convert a 3-byte string to an int
	adhoc.intFrom3Byte = function(s){
		return (((s.charCodeAt(0)<<8)+s.charCodeAt(1))<<8)+s.charCodeAt(2);
	}

	// Validate integer values
	adhoc.validateInt = function(v){
		return ((!isNaN(parseFloat(v))&&isFinite(v)&&(v==parseInt(v))) ? false : "Input is not an integer.");
	}
	// Validate float values
	adhoc.validateFloat = function(v){
		return ((!isNaN(parseFloat(v))&&isFinite(v)) ? false : "Input is not a float.");
	}
	// Validate string values
	adhoc.validateString = function(v){
		var escaped = v.replace(/\\./g, '');
		if(escaped.indexOf('"') >= 0)
			return 'Must escape double-quotes: \\"';
		if(escaped.length>=0 && escaped[escaped.length-1]=='\\')
			return 'Cannot end with single backslash';
		return false;
	}
	// Validate the name of a new identifier
	adhoc.validateIdentifier = function(v){
		if(!v.match(/^[_a-zA-Z][_a-zA-Z0-9]*$/)){
			return 'Not a valid variable name';
		}
	};
	// Validate the name of an action, and possibly check that it is not already defined
	adhoc.validateActionName = function(v, notExist){
		if(!v.match(/^[_a-zA-Z][ _a-zA-Z0-9]*$/)){
			return 'Not a valid action name';
		}
		if(notExist && adhoc.actionSearch(v, true, true).length){
			return 'Action name already used in project "'+adhoc.setting('projectName')+'"';
		}
	};
	// Validate the name of an action, and check that it is not already defined
	adhoc.validateActionDefName = function(v){
		return adhoc.validateActionName(v, true);
	}
	// Validate the name of a new paclage
	adhoc.validatePackageName = function(v){
		if(!v.match(/^[_a-zA-Z][ _a-zA-Z0-9]*$/)){
			return 'Not a valid package name';
		}
	};

	// Get and set GUI settings
	adhoc.setting = function(s, v){
		// If not being set, simply return the stored value
		if(v===undefined) return adhoc.settings[s];

		// Set the value in memory, and in the cookie, then return it
		adhoc.settings[s] = v;
		document.cookie = 'adhocSettings='+encodeURIComponent(Object.toJSON(adhoc.settings))+';path=/adhoc_demo/';
		return v;
	}

	// Display general messages to the user
	adhoc.message = function(t, s){
		// Add a title
		var LBtitle = $$('#theLightbox .nxj_lightboxTitle')[0];
		if(t == 'Error') LBtitle.addClassName('LBTitleError');
		else LBtitle.removeClassName('LBTitleError');
		if(t == 'Warning') LBtitle.addClassName('LBTitleWarn');
		else LBtitle.removeClassName('LBTitleWarn');
		LBtitle.update(t);

		// Create the new lightbox content
		var cont = $(document.createElement('div'));
		cont.addClassName('nxj_lightboxContent');
		cont.update(s);

		// Delete old lightbox content and add the new one, then show
		adhoc.removeAutocomplete();
		$$('#theLightbox .nxj_lightboxContent').each(Element.remove);
		$$('#theLightbox .nxj_lightbox')[0].appendChild(cont);
		$('theLightbox').show();
		return false;
	}
	// Display errors to the user
	adhoc.error = function(s){
		adhoc.message('Error', s);
	}
	// Prompt the user for an option
	adhoc.promptFlag = function(prmpt, opts, callBack){
		// Add the prompt text as the title
		var LBtitle = $$('#theLightbox .nxj_lightboxTitle')[0];
		LBtitle.removeClassName('LBTitleError').removeClassName('LBTitleWarn').update(prmpt);

		// Create the new lightbox content
		var cont = $(document.createElement('div'));
		cont.addClassName('nxj_lightboxContent');

		// Create and add the prompt options
		for(var i=0; i<opts.length; ++i){
			// Create the option itself
			var opt = $(document.createElement('input'));
			opt.setAttribute('type', 'radio');
			opt.setAttribute('name', 'lb_flag_opt');
			opt.setAttribute('id', 'lb_flag_opt_'+i);
			opt.setAttribute('value', i);
			opt.observe('click', function(){
				$('lb_flag_select').removeClassName('disabled');
			});
			cont.appendChild(opt);

			// Create a label
			var lbl = $(document.createElement('label'));
			lbl.setAttribute('for', 'lb_flag_opt_'+i);
			lbl.update(opts[i]);
			cont.appendChild(lbl);

			// Add a break
			var br = $(document.createElement('br'));
			cont.appendChild(br);
		}

		// Add a break
		var br = $(document.createElement('br'));
		cont.appendChild(br);

		// Create the confirmation button
		var butt = $(document.createElement('a'));
		butt.setAttribute('id', 'lb_flag_select');
		butt.addClassName('nxj_button');
		butt.addClassName('nxj_cssButton');
		butt.addClassName('disabled');
		butt.update('Select');
		butt.observe('click', function(){
			if(butt.hasClassName('disabled')) return;
			$('theLightbox').hide();
			callBack(parseInt($$('#theLightbox input:checked')[0].value));
		});
		cont.appendChild(butt);

		// Delete old lightbox content and add the new one, then show
		adhoc.removeAutocomplete();
		$$('#theLightbox .nxj_lightboxContent').each(Element.remove);
		$$('#theLightbox .nxj_lightbox')[0].appendChild(cont);
		$('theLightbox').show();
	}
	// Prompt the user for a value
	adhoc.promptValue = function(prmpt, vldt, algnR, callBack, searchFunc, sorryText){
		// Add the prompt text as the title
		var LBtitle = $$('#theLightbox .nxj_lightboxTitle')[0];
		LBtitle.removeClassName('LBTitleError').removeClassName('LBTitleWarn').update(prmpt);

		// Create the new lightbox content
		var cont = $(document.createElement('div'));
		cont.addClassName('nxj_lightboxContent');

		// Create a holder in case we use an autocomplete
		var holder = $(document.createElement('div'));
		holder.addClassName('searchHolder');
		cont.appendChild(holder);

		// Create and add the input field
		var inp = $(document.createElement('input'));
		var rem;
		var hid;
		inp.addClassName('nxj_input').addClassName(algnR ? 'textAlignRight' : 'textAlignLeft');
		inp.observe('keyup', function(e){
			// On keyup, validate the input
			var msg = vldt(this.value);
			if(msg){
				// Input is invalid, display a message
				$('lb_input_error').update(msg);
				$('lb_input_select').addClassName('disabled');

				// If the key was Esc, close the lightbox
				if((e.keyCode||e.which) == Event.KEY_ESC){
					$('theLightbox').hide();
				}
			}else{
				// Input is good, allow submission
				$('lb_input_error').update('');
				$('lb_input_select').removeClassName('disabled');

				// If the key happened to be Enter, try to submit now
				if((e.keyCode||e.which) == Event.KEY_RETURN){
					callBack(this.value, rem.value, hid.value);
					$('theLightbox').hide();
				// And if it happened to be Esc, then close the lightbox
				}else if((e.keyCode||e.which) == Event.KEY_ESC){
					$('theLightbox').hide();
				}
			}
		});
		holder.appendChild(inp);

		// Create and add another input for the reminder text
		rem = $(document.createElement('input'));
		rem.setAttribute('type', 'hidden');
		holder.appendChild(rem);

		// Create and add another input for the hidden value
		hid = $(document.createElement('input'));
		hid.setAttribute('type', 'hidden');
		holder.appendChild(hid);

		// If a search function is provided, attach an autocomplete
		if(searchFunc){
			// Create the autocomplete list
			var acList = $(document.createElement('div'));
			acList.setAttribute('id', 'lb_input_acList');
			acList.setAttribute('style', 'display:none;');
			holder.appendChild(acList);

			// Attach the autocomplete functions to the input
			adhoc.attachAutocomplete(inp, rem, hid, acList, searchFunc, function(){}, vldt, sorryText);
		}

		// Add a break
		var clear = $(document.createElement('div')).addClassName('clear');
		cont.appendChild(clear);

		// Add an error message holder
		var error = $(document.createElement('div'));
		error.setAttribute('id', 'lb_input_error');
		cont.appendChild(error);

		// Create the confirmation button
		var butt = $(document.createElement('a'));
		butt.setAttribute('id', 'lb_input_select');
		butt.addClassName('nxj_button');
		butt.addClassName('nxj_cssButton');
		butt.addClassName('disabled');
		butt.update('Select');
		butt.observe('click', function(){
			if(butt.hasClassName('disabled')) return;
			callBack(inp.value, rem.value, hid.value);
			$('theLightbox').hide();
		});
		cont.appendChild(butt);

		// Delete old lightbox content and add the new one, then show
		adhoc.removeAutocomplete();
		$$('#theLightbox .nxj_lightboxContent').each(Element.remove);
		$$('#theLightbox .nxj_lightbox')[0].appendChild(cont);
		$('theLightbox').show();
		inp.focus();
	}

	// Function to clear the listener on autocomplete
	adhoc.removeAutocomplete = function(){
		if(!adhoc.autocompleteListener) return;
		$$('#theLightbox input').each(function(elem){
			elem.blur();
			elem.setAttribute('disabled', 'disabled');
			elem.setAttribute('readonly', 'readonly');
			elem.stopObserving('keyup', adhoc.autocompleteListener);
			adhoc.canvas.focus();
		});
	}
	// Function to attach and operate the autocomplete
	adhoc.attachAutocomplete = function(input, reminder, hidden, list, acSearchFunc, acLoadFunc, validate, acSorryText){
		// Autocomplete globals
		var acLock = null;
		var acOpen = false;

		// Handle a keypress in the autocomplete
		function acInput(evt){
			// Get the keycode from the event
			var key = evt.which || window.event.keyCode;
			Event.stop(evt);

			// Get the search term from the input, close the list if none
			var term = $F(input);
			if(!term || validate(term)) return acClose();

			// Get the currently selected item if there is one
			var selectedItems = $$('.acItem.selected');
			var selectedItem = selectedItems.length ? selectedItems[0] : null;

			// Clear the search timer
			if(acLock) clearTimeout(acLock);

			// Handle different keys
			switch(key){
			// On ESC, close the menu
			case Event.KEY_ESC:
				acClose();
				break;

			// On RIGHT, complete the current item
			case Event.KEY_RIGHT:
				// If the autocomplete is not already open, do nothing
				if(!acOpen) break;

				// Otherwise, if there is a selected item, complete its value
				if(selectedItem){
					input.value = selectedItem.getAttribute('data-value');
					reminder.value = selectedItem.getAttribute('data-reminder');
					hidden.value = selectedItem.getAttribute('data-hidden');
				}
				break;

			// On DOWN, move to the next item
			case Event.KEY_DOWN:
				// If the autocomplete is not already open, set the search timer
				if(!acOpen){
					input.up().addClassName('acLoading');
					acLock = setTimeout(function(){
						acSearch(term);
					}, 150);
				// Otherwise, if there is a selected item, try to move to the next
				}else if(selectedItem){
					var next = selectedItem.next('div');
					if(next){
						selectedItem.removeClassName('selected');
						selectedItem = next;
						selectedItem.addClassName('selected');
					}
					// Update the autocomplete's input field
					input.value = selectedItem.getAttribute('data-value');
					reminder.value = selectedItem.getAttribute('data-reminder');
					hidden.value = selectedItem.getAttribute('data-hidden');
				}
				break;

			// On UP, move to the previous item
			case Event.KEY_UP:
				// If the autocomplete is not already open, set the search timer
				if(!acOpen){
					input.up().addClassName('searchLoading');
					acLock = setTimeout(function(){
						acSearch(term);
					}, 150);
				// Otherwise, if there is a selected item, try to move to the previous
				}else if(selectedItem){
					var prev = selectedItem.previous('div');
					if(prev){
						selectedItem.removeClassName('selected');
						selectedItem = prev;
						selectedItem.addClassName('selected');
					}
					// Update the autocomplete's input field
					input.value = selectedItem.getAttribute('data-value');
					reminder.value = selectedItem.getAttribute('data-reminder');
					hidden.value = selectedItem.getAttribute('data-hidden');
				}
				break;

			// On RETURN, if there is a selected item, use it, otherwise search
			case Event.KEY_RETURN:
				if(selectedItem){
					acLoad();
					acClose();
				}else{
					input.up().addClassName('searchLoading');
					acSearch(term);
				}
				break;

			// Any other key is assumed to have been typed as part of the search
			default:
				input.up().addClassName('searchLoading');
				acLock = setTimeout(function(){
					acSearch(term);
				}, 150);
			}
		}

		// Given a term, do a search, and update the autocomplete results
		function acSearch(term){
			// If there's no search term, become inactive
			if(!term){
				input.up().removeClassName('searchLoading');
				return;
			}

			// Regex for highlighting the search term in the results
			var acRxp = new RegExp('('+term+')', 'gi');

			// Perform a search with the provided function
			var results = acSearchFunc(term);

			// If there are matches, display them
			if(results.length){
				// Create a new autocomplete list from the results
				list.update('');
				results.each(function(item, idx){
					// Create a new autocomplete option
					var elem = $(document.createElement('div'));
					elem.addClassName('acItem');

					// If this is the first result, default it to be selected
					if(idx == 0){
						elem.addClassName('selected');
					}

					// Set the element's values from the result
					elem.setAttribute('data-value', item.value || '');
					elem.setAttribute('data-reminder', item.reminder || '');
					elem.setAttribute('data-hidden', item.hidden || '');
					elem.update(
						item.value.replace(acRxp, '<span class="match">$1</span>')
						+ ' <span class="reminder">'
						+ item.reminder
						+ '</span>'
					);

					// Enable clicking the element to complete the autocomplete
					elem.observe('click', function(){
						var selectedItems = $$('.acItem.selected');
						var selectedItem = selectedItems.length ? selectedItems[0] : null;
						if(selectedItem) selectedItem.removeClassName('selected');
						selectedItem = elem;
						selectedItem.addClassName('selected');
						input.value = selectedItem.getAttribute('data-value');
						reminder.value = selectedItem.getAttribute('data-reminder');
						hidden.value = selectedItem.getAttribute('data-hidden');
						acLoad();
						acClose();
					});

					// Add the element to the autocomplete list
					list.appendChild(elem);
				});

			// If no results, show sorry text
			}else{
				list.update('<div class="sorry">'+acSorryText+'</div>');
			}

			// Regardless, show the list now, and become inactive
			list.show();
			acOpen = true;
			input.up().removeClassName('searchLoading');
			clearTimeout(acLock);
		}

		// Perform the provided action on the selected result
		function acLoad(){
			input.blur();
			acLoadFunc(input.value, reminder.value, hidden.value);
		}

		// Close the autocomplete list
		function acClose(){
			list.hide();
			acOpen = false;
		}

		// Attache the listener to the autocomplete input
		adhoc.autocompleteListener = acInput;
		input.observe('keyup', acInput);
	}

	// Deactivate toolbox tools
	adhoc.deactivateAllTools = function(){
		$$('.toolboxItem.active').each(function(active){
			active.removeClassName('active');
		});
	}
	// Selects the contents of an element
	adhoc.selectText = function(elem){
		if(document.body.createTextRange){ // ms
			var range = document.body.createTextRange();
			range.moveToElementText(elem);
			range.select();
		} else if (window.getSelection) { // moz, opera, webkit
			var selection = window.getSelection();
			var range = document.createRange();
			range.selectNodeContents(elem);
			selection.removeAllRanges();
			selection.addRange(range);
		}
	}

	// Initialize history manager
	adhoc.resetHistory = function(){
		adhoc.history = {
			index: 0
			,history: []
			,record: function(action, target, prnt, bind){
				// Determine whether serialization needs to be deep or shallow
				var serializeDeep = false;
				switch(action){
				case 'package':
				case 'rename':
				case 'move':
					break;

				case 'add':
				case 'delete':
				default:
					serializeDeep = true;
				}

				// Replace all history items moving forward with this new one
				adhoc.history.history.splice(
					adhoc.history.index
					,adhoc.history.history.length - adhoc.history.index
					,{
						action: action
						,target: target
						,parentId: prnt.id
						,serial: adhoc.serializeComplete(prnt, serializeDeep)
						,bind: bind
					}
				);

				// Move up the history index
				++adhoc.history.index;

				// Activate the 'save' button if user is logged in
				if(adhoc.setting('username')) $('savePackageButton').removeClassName('disabled');

				// Activate the undo button, and deactivate redo
				$('histBack').removeClassName('disabled');
				$('histFwd').addClassName('disabled');
			}
			,undo: function(){
				// Get the item to be undone unless there are none
				if(adhoc.history.index <= 0) return;
				var item = adhoc.history.history[--adhoc.history.index];

				// Activate the redo button, and if we've reached the oldest history item, deactivate undo
				$('histFwd').removeClassName('disabled');
				if(adhoc.history.index <= 0) $('histBack').addClassName('disabled');

				// Undo different types of actions
				switch(item.action){
				// Undo an addition
				case 'add':
					// Edge cases
					var n = adhoc.allNodes[item.target];
					if(!n){
						adhoc.error("Unable to undo node addition");
						break;
					}
					if(n == adhoc.rootNode){
						adhoc.error("You cannot un-add the project root");
					}
					// Deselect the node and delete it
					if(adhoc.selectedNode == n){
						n.selected = false;
						adhoc.selectedNode = null;
					}
					adhoc.deleteNode(n);
					adhoc.refreshRender();
					break;

				// Undo a move
				case 'move':
					var oldP = adhoc.allNodes[item.parentId].parent
					adhoc.restoreNode(adhoc.allNodes[item.parentId], item.serial);
					adhoc.moveNode(adhoc.allNodes[item.parentId], oldP, adhoc.allNodes[item.parentId].parent);
					adhoc.refreshRender();
					break;

				// Undo a package change
				case 'package':
					adhoc.restoreNode(adhoc.allNodes[item.parentId], item.serial);
					var newP = adhoc.allNodes[item.parentId].package;
					adhoc.allNodes[item.parentId].package = item.target;
					adhoc.updatePackageName(adhoc.allNodes[item.parentId], item.target, newP);
					$('projectName').value = adhoc.allNodes[item.parentId].package;
					adhoc.refreshRender();
					break;

				// Undo a rename
				case 'rename':
				// Undo a deletion
				case 'delete':
				// Undo a general action
				default:
					adhoc.restoreNode(adhoc.allNodes[item.parentId], item.serial);
					adhoc.refreshRender();
				}

				// Activate the 'save' button if user is logged in
				if(adhoc.setting('username')) $('savePackageButton').removeClassName('disabled');

				// If the next item is bound to this one, do it as well
				if(item.bind) adhoc.history.undo();
			}
			,redo: function(){
				// Get the item to be redone unless there are none
				if(adhoc.history.index == adhoc.history.history.length) return;
				var item = adhoc.history.history[adhoc.history.index];

				// Redo different types of actions
				switch(item.action){
				// Redo an add
				case 'add':
					adhoc.restoreNode(adhoc.allNodes[item.parentId], item.serial);
					adhoc.refreshRender();
					break;

				// Redo a rename
				case 'rename':
					if(!isNaN(parseFloat(item.target)) && isFinite(item.target)){
						var ref = adhoc.allNodes[item.target];
						adhoc.allNodes[item.parentId].package = ref.package;
						adhoc.allNodes[item.parentId].name = ref.name;
					}else{
						adhoc.allNodes[item.parentId].package = adhoc.setting('projectName');
						adhoc.allNodes[item.parentId].name = item.target;
					}
					adhoc.refreshRender();
					break;

				// Redo a move
				case 'move':
					adhoc.allNodes[item.parentId].childType = item.target[1];
					adhoc.moveNode(adhoc.allNodes[item.parentId], adhoc.allNodes[item.parentId].parent, adhoc.allNodes[item.target[0]]);
					adhoc.refreshRender();
					break;

				// Redo a package change
				case 'package':
					adhoc.updatePackageName(adhoc.allNodes[item.parentId], adhoc.allNodes[item.parentId].package, item.target);
					$('projectName').value = item.target;
					adhoc.refreshRender();
					break;

				// Redo a deletion
				case 'delete':
					// Edge cases
					var n = adhoc.allNodes[item.target];
					if(!n){
						adhoc.error("Unable to redo deletion");
						break;
					}
					if(n == adhoc.rootNode){
						adhoc.error("You cannot delete the project root");
						break;
					}
					// Deselect the node and delete it
					if(adhoc.selectedNode == n){
						n.selected = false;
						adhoc.selectedNode = null;
					}
					adhoc.deleteNode(n);
					adhoc.refreshRender();
				}

				// Activate the 'save' button if user is logged in
				if(adhoc.setting('username')) $('savePackageButton').removeClassName('disabled');

				// Activate the undo button, and if we're at the newest history item, deactivate redo
				++adhoc.history.index;
				$('histBack').removeClassName('disabled');
				if(adhoc.history.index == adhoc.history.history.length){
					$('histFwd').addClassName('disabled');
				// Otherwise, if the next item is bound to this one, do it as well
				}else if(adhoc.history.history[adhoc.history.index].bind){
					adhoc.history.redo();
				}
			}
		};
	}

	// Initialize the GUI editor
	adhoc.init = function(){
		// Load settings from cookie
		if(document.cookie && document.cookie.indexOf('adhocSettings=')>=0){
			var settingsJSON = document.cookie.match(/adhocSettings=([^;]*)/);
			var loadedSettings = decodeURIComponent(settingsJSON[1]).evalJSON();
			for(var i in loadedSettings){
				if(i == 'projectName') continue;
				adhoc.setting(i, loadedSettings[i]);
			}
		}else{
			document.cookie = 'adhocSettings='+encodeURIComponent(Object.toJSON(adhoc.settings))+';path=/adhoc_demo/';
		}

		// Activate new package button
		$('newPackageButton').observe('click', function(){
			adhoc.promptFlag('New Package: Are you sure?', ['Yes','No'], function(val){
				if(val == 1) return;
				adhoc.setting('projectId', 0);
				adhoc.setting('projectName', 'New Project');
				$('projectName').value = adhoc.setting('projectName');
				$('savePackageButton').addClassName('disabled');
				adhoc.selectedNode = null;
				adhoc.display_scale = 1.0;
				adhoc.display_x = 0;
				adhoc.display_y = 0;
				adhoc.lastId = 0;
				adhoc.registeredActions = [];
				adhoc.allNodes = [];
				adhoc.rootNode = null;
				adhoc.rootNode = adhoc.createNode(
					null
					,null
					,null
					,adhoc.nodeTypes.ACTION
					,adhoc.nodeWhich.ACTION_DEFIN
					,adhoc.nodeChildType.STATEMENT
					,null
					,'New Action'
					,null
				);
				adhoc.resetHistory();
				adhoc.refreshRender();
			});
		});

		// Activate load package button
		$('loadPackageButton').observe('click', function(){
			$('projectLightbox').show();
		});

		// Activate load project options
		$$('#projectSelect .nxj_selectOption').each(function(option){
			option.observe('mouseover', function(){
				$$('#projectSelect .nxj_selectOption').each(function(otherOption){
					otherOption.removeClassName('hovered');
				});
				option.addClassName('hovered');
			});
			option.observe('click', function(){
				$$('#projectSelect .nxj_selectOption').each(function(otherOption){
					otherOption.removeClassName('selected');
					otherOption.removeClassName('hovered');
				});
				option.addClassName('selected');
				$('projectLightbox').hide();
				adhoc.loadProject(this.getAttribute('data-value'));
			});
		});

		// Activate package name input
		$('projectName').observe('focus', function(){
			adhoc.promptValue('Rename This Package', adhoc.validatePackageName, false, function(val){
				var oldPackage = adhoc.setting('projectName');
				if(oldPackage == val) return;
				adhoc.history.record('package', val, adhoc.rootNode);
				adhoc.updatePackageName(adhoc.rootNode, oldPackage, val);
				$('projectName').value = val;
				adhoc.setting('projectName', val);
				adhoc.refreshRender();
			});
		});

		// Activate save package button
		$('savePackageButton').observe('click', function(){
			// No action if disabled, otherwise save
			if($(this).hasClassName('disabled')) return;
			adhoc.saveProject();
		});

		// Activate connector label toggles
		$$('#controls input[name=labelConnectors]').each(function(elem){
			elem.observe('change', function(){
				if(!this.checked) return;
				adhoc.setting('labelConnectors', parseInt(this.value));
				adhoc.refreshRender();
			});
		});
		// Activate show placeholders toggles
		$$('#controls input[name=showNullNodes]').each(function(elem){
			elem.observe('change', function(){
				if(!this.checked) return;
				adhoc.setting('showNullNodes', false||parseInt(this.value));
				adhoc.refreshRender();
			});
		});
		// Activate colorscheme toggles
		$$('#controls input[name=colorScheme]').each(function(elem){
			elem.observe('change', function(){
				if(!this.checked) return;
				adhoc.setting('colorScheme', this.value);
				$(document.body)
					.removeClassName('dark')
					.removeClassName('light')
					.addClassName(this.value);
				adhoc.refreshRender();
			});
		});

		// Activate the generate button
		$('generateButton').observe('click', function(){
			adhoc.generateCode();
		});

		// Activate the top control panel toggle
		$('controlsToggle').observe('click', function(){
			$('controls').toggleClassName('collapsed');
		});

		// Activate the output viewer's close button
		$$('#output .close').each(function(elem){
			elem.observe('click', function(){
				$('output').hide();
			});
		});

		// Initialize drawing canvas
		adhoc.canvas = $('canvas');
		if(!adhoc.canvas) return adhoc.error("Could not find drawing canvas.");
		adhoc.sizeCanvas();
		Event.observe(window, 'resize', adhoc.sizeCanvas);

		// Set some drawing parameters
		if(!adhoc.canvas.getContext) return adhoc.error("Your browser does not support drawing.");
		var ctx = adhoc.canvas.getContext('2d');
		ctx.lineWidth = 6;
		ctx.font = "20px Arial";
		ctx.fillStyle = adhoc.textColor;

		// Ready the toolbox categories
		var tab, item, icon, text, clear, passed=0, toolbox=$('toolbox'), toolboxTabs=$('toolboxTabs'), toolboxItems=$('toolboxItems');
		for(var i=0,leni=adhoc.nodeTypeNames.length; i<leni; ++i){
			// Print section headings (except null and assignment)
			if(i!=0 && i!=5){
				// Heading
				tab = $(document.createElement('div'));
				tab.addClassName('toolboxTab').update(adhoc.nodeTypeNames[i]);
				tab.setAttribute('data-target', adhoc.nodeTypeNames[i]);
				tab.observe('click', function(){
					$('toolbox').className = this.getAttribute('data-target');
				});

				// Add
				toolboxTabs.appendChild(tab);
			}

			// Print toolbox items
			for(var j=0,lenj=adhoc.nodeWhichNames[i].length; j<lenj; ++j){
				if(j+passed == 0) continue;
				if(j+passed == 30) continue;
				if(j+passed == 32) continue;
				if(j+passed == 34) continue;
				if(j+passed == 45) continue;

				// Item
				item = $(document.createElement('div'));
				item.addClassName('toolboxItem').addClassName(adhoc.nodeTypeNames[i]);
				item.setAttribute('data-type', i);
				item.setAttribute('data-which', j+passed);
				item.observe('click', function(){
					var wasActive = this.hasClassName('active');
					adhoc.deactivateAllTools();
					if(!wasActive) this.addClassName('active');
				});

				// Icon
				icon = $(document.createElement('div'));
				icon.addClassName('toolboxItemIcon').addClassName('toolIcon_'+i+'_'+(j+passed));
				item.appendChild(icon);

				// Text
				text = $(document.createElement('div'));
				text.addClassName('toolboxItemText').update(adhoc.nodeWhichNames[i][j][0]);
				item.appendChild(text);

				// Add
				toolboxItems.appendChild(item);

				// Spacer
				clear = $(document.createElement('div'));
				clear.addClassName('clear');
				toolboxItems.appendChild(clear);
			}
			passed += lenj;
		}

		// Handle mouse down
		var downFunc = function(e){
			// Handle touch
			if(e.touches && e.touches.length) e = e.touches[0];

			// Get the scaled location of the click
			var offset = adhoc.canvas.positionedOffset();
			var click = {
				x: (Event.pointerX(e) - offset.left + adhoc.display_x) / adhoc.display_scale
				,y: (Event.pointerY(e) - offset.top + adhoc.display_y) / adhoc.display_scale
			};
			var clickedNode = adhoc.getClickedNode(adhoc.rootNode, click);

			// Restore any detached nodes
			if(adhoc.movingNodeTimeout) clearTimeout(adhoc.movingNodeTimeout);
			if(adhoc.movingNode) adhoc.reattachNode(click);

			// If a node was clicked, figure out what to do with it
			if(clickedNode){
				// Detach the clicked node
				adhoc.movingNodeTimeout = setTimeout(function(){
					adhoc.detachNode(click, clickedNode);
				}, 300);

			// Otherwise, we're trying to move the canvas
			}else{
				adhoc.canvas.addClassName('willMove');
				adhoc.canvas.setAttribute('data-startx', adhoc.display_x);
				adhoc.canvas.setAttribute('data-starty', adhoc.display_y);
				adhoc.canvas.setAttribute('data-startpx', Event.pointerX(e));
				adhoc.canvas.setAttribute('data-startpy', Event.pointerY(e));
			}
		};
		// Handle mouse up
		var upFunc = function(e){
			// We're done moving the canvas
			if(adhoc.canvas.hasClassName('willMove')){
				adhoc.canvas.removeClassName('willMove');
			}
			if(adhoc.canvas.hasClassName('moving')){
				adhoc.canvas.removeClassName('moving');
				return;
			}

			// Handle touch
			if(e.touches && e.touches.length) e = e.touches[0];

			// Get the scaled location of the click
			var offset = adhoc.canvas.positionedOffset();
			var click = {
				x: (Event.pointerX(e) - offset.left + adhoc.display_x) / adhoc.display_scale
				,y: (Event.pointerY(e) - offset.top + adhoc.display_y) / adhoc.display_scale
			};
			var clickedNode = adhoc.getClickedNode(adhoc.rootNode, click);

			// Restore any detached nodes
			if(adhoc.movingNodeTimeout) clearTimeout(adhoc.movingNodeTimeout);
			if(adhoc.movingNode) return  adhoc.reattachNode(click);

			// If a tool is active and a node was clicked, figure out what to do with it
			var activeTools = $$('.toolboxItem.active');
			if(activeTools.length && clickedNode){
				// Get the tool's type, which, parent, and replacee
				var type = parseInt(activeTools[0].getAttribute('data-type'));
				var which = parseInt(activeTools[0].getAttribute('data-which'));
				var prnt = (clickedNode.nodeType == adhoc.nodeTypes.TYPE_NULL) ? clickedNode.parent : clickedNode;
				var repl = (prnt == clickedNode) ? null : clickedNode;

				// For variables, determine the which from context
				if(type == adhoc.nodeTypes.VARIABLE){
					var neededChildren = adhoc.nodeWhichChildren[prnt.nodeType][adhoc.nodeWhichIndices[prnt.which][1]];
					var assignOk = false;

					for(var i=0; i<neededChildren.length; ++i){
						var role = neededChildren[i];
						// Skip if the child's type is not allowed
						if(adhoc.nodeChildTypeInfo[role.childType].nodeTypes.indexOf(adhoc.nodeTypes.VARIABLE) < 0) continue;
						// Skip if the child's sub-type is not allowed
						if(adhoc.nodeChildTypeInfo[role.childType].nodeNotWhich.indexOf(adhoc.nodeWhich.VARIABLE_ASIGN) >= 0) continue;
						// Skip if the parent has already maxed the child's type
						if(role.max!=null && adhoc.countChildrenOfType(prnt, role.childType, true)>=role.max) continue;
						// Variable assignments are ok
						assignOk = true;
						break;
					}
					if(assignOk){
						which = adhoc.nodeWhich.VARIABLE_ASIGN;
					}else{
						which = adhoc.nodeWhich.VARIABLE_EVAL;
					}
				}

				// Make a callback that takes a childType and does the rest of node creation
				var createNodeWithType = function(childType){
					// Make sure the child type is ok with the which
					if(adhoc.nodeChildTypeInfo[childType].nodeTypes.indexOf(type) < 0
							|| adhoc.nodeChildTypeInfo[childType].nodeNotWhich.indexOf(type) >= 0){
						var typeName = adhoc.nodeWhichNames[type][adhoc.nodeWhichIndices[which][1]][0];
						var roleName = adhoc.nodeChildTypeInfo[childType].label;
						adhoc.error("A '"+typeName+"' node cannot fill the '"+roleName+"' role.");
						return;
					}

					// Ask for node info based on which
					switch(which){
					case adhoc.nodeWhich.ACTION_DEFIN:
						// Prompt for an action name
						adhoc.promptValue('Enter an action name:', adhoc.validateActionDefName, false, function(val){
							adhoc.deactivateAllTools();
							adhoc.createNode(null, prnt, repl, type, which, childType, null, val);
						});
						break;

					case adhoc.nodeWhich.ACTION_CALL:
						// Prompt for an action name
						adhoc.promptValue('Enter an action name:', adhoc.validateActionName, false, function(val, rem, hid){
							adhoc.deactivateAllTools();
							adhoc.createNode(null, prnt, repl, type, which, childType, rem, val, null, hid);
						}, adhoc.actionSearch, 'Not found in loaded projects');
						break;

					case adhoc.nodeWhich.VARIABLE_ASIGN:
					case adhoc.nodeWhich.VARIABLE_EVAL:
						// Prompt for a variable name
						adhoc.promptValue('Enter a variable name:', adhoc.validateIdentifier, false, function(val, rem, hid){
							adhoc.deactivateAllTools();
							adhoc.createNode(null, prnt, repl, type, which, childType, null, val, null, hid);
						}, adhoc.genScopeSearch(prnt, false), 'New variable');
						break;

					case adhoc.nodeWhich.LITERAL_BOOL:
						// Prompt for a boolean value
						adhoc.promptFlag('Select a boolean value:', ['true', 'false'], function(val){
							adhoc.deactivateAllTools();
							adhoc.createNode(null, prnt, repl, type, which, childType, null, null, !val);
						});
						break;

					case adhoc.nodeWhich.LITERAL_INT:
						// Prompt for an integer value
						adhoc.promptValue('Enter an integer:', adhoc.validateInt, true, function(val){
							adhoc.deactivateAllTools();
							adhoc.createNode(null, prnt, repl, type, which, childType, null, null, parseInt(val));
						});
						break;

					case adhoc.nodeWhich.LITERAL_FLOAT:
						// Prompt for a float value
						adhoc.promptValue('Enter a float:', adhoc.validateFloat, true, function(val){
							adhoc.deactivateAllTools();
							adhoc.createNode(null, prnt, repl, type, which, childType, null, null, parseFloat(val));
						});
						break;

					case adhoc.nodeWhich.LITERAL_STRNG:
						// Prompt for a string value
						adhoc.promptValue('Enter a string:', adhoc.validateString, false, function(val){
							adhoc.deactivateAllTools();
							adhoc.createNode(null, prnt, repl, type, which, childType, null, null, val);
						});
						break;

					case adhoc.nodeWhich.LITERAL_ARRAY:
					case adhoc.nodeWhich.LITERAL_HASH:
					case adhoc.nodeWhich.LITERAL_STRCT:
						adhoc.deactivateAllTools();
						// TODO: Prompt for literal value
						adhoc.message('This type of literal is not yet implemented'); break;
						adhoc.createNode(null, prnt, repl, type, which, childType);
						break;

					default:
						adhoc.deactivateAllTools();
						adhoc.createNode(null, prnt, repl, type, which, childType);
					}
				}

				// If we're dealing with a replacement, so take that role
				if(repl){
					createNodeWithType(repl.childType);
					return;
				}

				// Get the child roles this node can fill
				var neededChildren = adhoc.nodeWhichChildren[prnt.nodeType][adhoc.nodeWhichIndices[prnt.which][1]];
				var roleOptions = [];
				var roleOptionNames = [];
				var someOk = false;
				// Loop over the types of children the parent needs
				for(var i=0; i<neededChildren.length; ++i){
					var role = neededChildren[i];
					// Skip if the child's type is not allowed
					if(adhoc.nodeChildTypeInfo[role.childType].nodeTypes.indexOf(type) < 0) continue;
					// Skip if the child's sub-type is not allowed
					if(adhoc.nodeChildTypeInfo[role.childType].nodeNotWhich.indexOf(which) >= 0) continue;
					// The child type is allowed for at least one role
					someOk = true;
					// Skip if the parent has already maxed the child's type
					if(role.max!=null && adhoc.countChildrenOfType(prnt, role.childType, true) >= role.max) continue;

					// If we make it here, the child type is viable
					roleOptions.push(role.childType);
					roleOptionNames.push(adhoc.nodeChildTypeInfo[role.childType].label);
				}

				// Report errors if there are no roles available
				if(!roleOptions.length){
					var parentName = adhoc.nodeWhichNames[adhoc.nodeWhichIndices[prnt.which][0]][adhoc.nodeWhichIndices[prnt.which][1]][0];
					var childName = adhoc.nodeWhichNames[type][adhoc.nodeWhichIndices[which][1]][0];
					adhoc.error(someOk
						? "The parent node cannot directly hold any more children of this type."
						: "A '"+parentName+"' node cannot hold a '"+childName+"' node directly."
					);

				// If the parent is a variable assignment, but is acting as 'STORAGE', then fail
				}else if(prnt.which==adhoc.nodeWhich.VARIABLE_ASIGN && prnt.childType==adhoc.nodeChildType.STORAGE){
					adhoc.error("You cannot directly assign a value to a variable that belongs to an assignment node.");

				// If no errors, but only one option, then just use that
				}else if(roleOptions.length == 1){
					createNodeWithType(roleOptions[0]);

				// If multiple roles available, prompt for which role will be filled
				}else{
					adhoc.promptFlag('Select a role for the new node:', roleOptionNames, function(val){
						createNodeWithType(roleOptions[val]);
					});
				}

			// If a node is clicked with no tool active, figure out what to do
			}else if(clickedNode){
				// If the clicked node was already selected, try to rename it
				if(clickedNode==adhoc.selectedNode){
					switch(clickedNode.which){
					// Rename a defined action
					case adhoc.nodeWhich.ACTION_DEFIN:
						adhoc.promptValue('Rename this action:', adhoc.validateActionDefName, false, function(val, rem, hid){
							adhoc.history.record('rename', (hid?parseInt(hid):val), clickedNode);
							adhoc.renameNode(clickedNode, rem, val, hid);
							adhoc.refreshRender();
						});
						break;

					//Change an action call
					case adhoc.nodeWhich.ACTION_CALL:
						adhoc.promptValue('Call a different action:', adhoc.validateActionName, false, function(val, rem, hid){
							adhoc.history.record('rename', (hid?parseInt(hid):val), clickedNode);
							adhoc.renameNode(clickedNode, rem, val, hid);
							adhoc.refreshRender();
						}, adhoc.actionSearch, 'Not found in loaded projects');
						break;

					// Rename a variable
					case adhoc.nodeWhich.VARIABLE_ASIGN:
					case adhoc.nodeWhich.VARIABLE_EVAL:
						adhoc.promptValue('Enter a variable name:', adhoc.validateIdentifier, false, function(val, rem, hid){
							var nodeToRename = clickedNode.referenceId ? adhoc.allNodes[clickedNode.referenceId] : clickedNode;
							adhoc.history.record('rename', (hid?parseInt(hid):val), nodeToRename);
							adhoc.renameNode(nodeToRename, rem, val, hid);
							adhoc.refreshRender();
						}, adhoc.genScopeSearch(clickedNode.parent, false), 'New variable');
						break;

					default:
					}

				// If not, select it
				}else{
					if(adhoc.selectedNode) adhoc.selectedNode.selected = false;
					clickedNode.selected = true;
					adhoc.selectedNode = clickedNode;
				}

			// Empty space was clicked, deselect the selected node
			}else if(adhoc.selectedNode){
				adhoc.selectedNode.selected = false;
				adhoc.selectedNode = null;
			}
			adhoc.refreshRender();
		};
		// Handle mouse move
		var moveFunc = function(e){
			// Handle touch
			if(e.touches && e.touches.length) e = e.touches[0];

			// If the canvas isn't moving, just return
			if(adhoc.canvas.hasClassName('willMove')){
				adhoc.canvas.removeClassName('willMove');
				adhoc.canvas.addClassName('moving');
			}
			if(!adhoc.canvas.hasClassName('moving') && !adhoc.movingNode) return;

			// Get the scaled location of the cursor
			var offset = adhoc.canvas.positionedOffset();
			var click = {
				x: (Event.pointerX(e) - offset.left + adhoc.display_x) / adhoc.display_scale
				,y: (Event.pointerY(e) - offset.top + adhoc.display_y) / adhoc.display_scale
			};

			// If there is a detached node, move that instead
			if(adhoc.movingNode) return adhoc.moveDetachedNode(click);

			// Get the canvas' move coordinates
			var startx = parseFloat(adhoc.canvas.getAttribute('data-startx'));
			var starty = parseFloat(adhoc.canvas.getAttribute('data-starty'));
			var startpx = parseFloat(adhoc.canvas.getAttribute('data-startpx'));
			var startpy = parseFloat(adhoc.canvas.getAttribute('data-startpy'));

			// Set the new coordinates and redraw
			adhoc.display_x = startx + startpx - Event.pointerX(e);
			adhoc.display_y = starty + startpy - Event.pointerY(e);
			adhoc.refreshRender();
		};
		// Handle key down
		var keyDownFunc = function(e){
			var key = e.which || window.event.keyCode;
			switch(key){
			// If various CTRL or CMD keys, set alternamte key mode on
			case Event.KEY_CONTROL:
			case Event.KEY_COMMAND1:
			case Event.KEY_COMMAND2:
			case Event.KEY_COMMAND3:
				adhoc.alternateKeys = true;
				break;

			// (ESC) close dialogs and deselect nodes
			case Event.KEY_ESC:
				if(!$('theLightbox').visible()) $('output').hide();
				$('theLightbox').hide();
				$('projectLightbox').hide();
				if(adhoc.selectedNode){
					adhoc.selectedNode.selected = false;
					adhoc.selectedNode = null;
				}
				adhoc.refreshRender();
				break;

			// (Enter) several behaviors
			case Event.KEY_RETURN:
				// Submit certain dialogs
				if($('projectLightbox').visible()){
					// Load the hovered project
					$$('#projectSelect .nxj_selectOption.hovered').each(function(hoveredProject){
						hoveredProject.click();
					});
				}else if($('theLightbox').visible()){
					// Submit prompt flag
					var checkedRadio = false;
					$$('#theLightbox input[name=lb_flag_opt]').each(function(radio){
						if(radio.checked) checkedRadio = true;
					});
					if(checkedRadio){
						$('lb_flag_select').click();
						break;
					}
				}
				break;

			// (Up, Down, Left, Right) several behaviors
			case Event.KEY_UP:
			case Event.KEY_DOWN:
			case Event.KEY_LEFT:
			case Event.KEY_RIGHT:
				// Create handles on things that can be scrolled
				var theLightbox = $('theLightbox');
				var projectSelect = $('projectSelect');

				// Scroll through loadable projects
				if($('projectLightbox').visible()){
					if(!projectSelect.hasClassName('nxj_selectOpen')){
						projectSelect.addClassName('nxj_selectOpen');
						var projects = projectSelect.select('.nxj_selectOption');
						if(projects.length) projects[0].addClassName('hovered');
					}else{
						var projects = projectSelect.select('.nxj_selectOption');
						var hovered = projectSelect.select('.nxj_selectOption.hovered');
						if(hovered.length){
							switch(key){
							case Event.KEY_DOWN:
							case Event.KEY_RIGHT:
								hovered[0].removeClassName('hovered');
								projects[Math.min(projects.indexOf(hovered[0])+1,projects.length-1)].addClassName('hovered');
								break;
							case Event.KEY_UP:
							case Event.KEY_LEFT:
								hovered[0].removeClassName('hovered');
								projects[Math.max(projects.indexOf(hovered[0])-1,0)].addClassName('hovered');
								break;
							}
						}else{
							if(projects.length) projects[0].addClassName('hovered');
						}
					}
				}else if(theLightbox.visible()){
				}
				break;

			// (CTRL+a) select generated code
			case 65:
				if(adhoc.alternateKeys){ Event.stop(e);
					if($('output').visible()) adhoc.selectText($('generatedCode'));
				}
				break;

			// (CTRL+g) generate code!
			case 71:
				if(adhoc.alternateKeys){ Event.stop(e);
					adhoc.generateCode();
				}
				break;

			// (CTRL+k) Toggle the debugger
			case 75:
				if(adhoc.alternateKeys){ Event.stop(e);
					adhoc.setting('dbg', !adhoc.setting('dbg'));
					adhoc.refreshRender();
				}
				break;

			// (CTRL+l) Load a file
			case 76:
				if(adhoc.alternateKeys){ Event.stop(e);
					$('projectLightbox').show();
				}
				break;

			// (CTRL+s) Save a file
			case 83:
				if(adhoc.alternateKeys){ Event.stop(e);
					adhoc.saveProject();
				}
				break;

			// (CTRL+y) Redo
			case 89:
				if(adhoc.alternateKeys){ Event.stop(e);
					adhoc.history.redo();
				}
				break;

			// (CTRL+z) Undo
			case 90:
				if(adhoc.alternateKeys){ Event.stop(e);
					adhoc.history.undo();
				}
				break;

			// (`) Toggle control panel
			case 192:
				Event.stop(e);
				$('controls').toggleClassName('collapsed');
				break;

			// Do nothing if the key is unknown
			default:
				break;
			}
			return false;
		}
		// Handle key up
		var keyUpFunc = function(e){
			var key = e.which || window.event.keyCode;
			switch(key){
			// (CTRL/CMD) Set alternamte key mode off
			case Event.KEY_CONTROL:
			case Event.KEY_COMMAND1:
			case Event.KEY_COMMAND2:
			case Event.KEY_COMMAND3:
				adhoc.alternateKeys = false;
				break;

			// (DEL) Remove the selected node and it's children
			case Event.KEY_DELETE:
				// Edge cases
				if(!adhoc.selectedNode) break;
				if(adhoc.selectedNode == adhoc.rootNode){
					adhoc.error("You cannot delete the project root.");
					break;
				}
				// Deselect the node, record a deletion and actually delete
				adhoc.selectedNode.selected = false;
				adhoc.history.record(
					'delete'
					,adhoc.selectedNode.id
					,adhoc.selectedNode.parent
				);
				adhoc.deleteNode(adhoc.selectedNode);
				adhoc.selectedNode = null;
				adhoc.refreshRender();
				break;

			// (Unknown) Do nothing
			default:
				if(adhoc.setting('dbg')) console.log(key);
			}
		}

		// Attach event listeners
		adhoc.canvas.observe('mousedown', downFunc);
		adhoc.canvas.observe('touchstart', downFunc);
		adhoc.canvas.observe('mouseup', upFunc);
		adhoc.canvas.observe('touchend', upFunc);
		adhoc.canvas.observe('mousemove', moveFunc);
		adhoc.canvas.observe('touchmove', moveFunc);
		Event.observe(window, 'keydown', keyDownFunc);
		Event.observe(window, 'keyup', keyUpFunc);

		// Ready the zoom buttons
		$('zoomIn').observe('click', function(){
			if($('zoomIn').hasClassName('disabled')) return;
			$('zoomPrcent').update(((adhoc.display_scale *= 1.2)*100).toPrecision(3));
			if(adhoc.display_scale > 8) $('zoomIn').addClassName('disabled');
			$('zoomOut').removeClassName('disabled');
			adhoc.refreshRender();
		});
		$('zoomOut').observe('click', function(){
			if($('zoomOut').hasClassName('disabled')) return;
			$('zoomPrcent').update(((adhoc.display_scale /= 1.2)*100).toPrecision(3));
			if(adhoc.display_scale < 0.12) $('zoomOut').addClassName('disabled');
			$('zoomIn').removeClassName('disabled');
			adhoc.refreshRender();
		});

		// Create a new root node
		adhoc.rootNode = adhoc.createNode(
			null
			,null
			,null
			,adhoc.nodeTypes.ACTION
			,adhoc.nodeWhich.ACTION_DEFIN
			,adhoc.nodeChildType.STATEMENT
			,null
			,'New Action'
			,null
		);

		// Initialize the history manager
		adhoc.resetHistory();

		// Draw the initial canvas
		adhoc.refreshRender();

		// Bind to the window if debug mode is on
		if(adhoc.setting('dbg')) window.adhoc = adhoc;

		// Ready the history buttons
		$('histBack').observe('click', adhoc.history.undo);
		$('histFwd').observe('click', adhoc.history.redo);
	}

	// Generate the next available node ID
	adhoc.nextId = function(){
		return ++adhoc.lastId;
	}
	// Create a new node with just a type and empty contents
	adhoc.createNode = function(i, p, r, t, w, c, k, n, v, f){
		// Set the type, which, and childType if they're not passed
		if(!t) t = adhoc.nodeTypes.TYPE_NULL;
		if(!w) w = adhoc.nodeWhich.WHICH_NULL;
		if(!c) c = adhoc.nodeChildType.CHILD_NULL;

		// Create the object with its params
		var newNode = {
			id: (i ? i : ((t == adhoc.nodeTypes.TYPE_NULL) ? null : adhoc.nextId()))
			,parent: p
			,scope: null
			,referenceId: f ? parseInt(f) : null
			,nodeType: t
			,which: w
			,childType: c
			,dataType: null
			,package: (t == adhoc.nodeTypes.TYPE_NULL) ? null : (k ? k : adhoc.setting('projectName'))
			,name: n
			,value: v
			,children: []
			,scopeVars: []
			,references: []
			,x: 0
			,y: 0
			,highlighted: false
			,error: null
			,detached: false
			,moveClick: null
			,moveTarget: null
			,movePos: {
				x: 0
				,y: 0
			}
			,width: null
			,height: null
			,subTreeHeight: 100
		};

		// Add to the list of all nodes and record in the history
		if(t != adhoc.nodeTypes.TYPE_NULL) adhoc.allNodes[newNode.id] = newNode;

		// Assign to the parent if present
		if(p){
			// If there is a null node to replace, do so
			if(!r && t!=adhoc.nodeTypes.TYPE_NULL) r = adhoc.getFirstNullChildByType(p, c);
			if(r) p.children[p.children.indexOf(r)] = newNode;
			else{
				var pp=0
					,pc=0
					,reached=false
					,neededChildren=adhoc.nodeWhichChildren[p.nodeType][adhoc.nodeWhichIndices[p.which][1]]
					;
				while(true){
					if(pc >= p.children.length){
						p.children.push(newNode);
						break;
					}
					if(neededChildren[pp].childType == c){
						reached = true;
					}
					if(neededChildren[pp].childType == p.children[pc].childType){
						++pc;
						continue;
					}
					if(!reached){
						++pp;
						continue;
					}
					p.children.splice(pc, 0, newNode);
					break;
				}
			}

			// Assign this variable to the appropriate scope as well
			if(w == adhoc.nodeWhich.VARIABLE_ASIGN){
				var searchFunc = adhoc.genScopeSearch(p, true);
				if(!searchFunc(n).length){
					var scope = p;
					while(scope.which != adhoc.nodeWhich.ACTION_DEFIN
							&& scope.which != adhoc.nodeWhich.CONTROL_LOOP){
						scope = scope.parent;
					}
					scope.scopeVars.push(newNode);
				}
			}

			// Assign this node to any other that it references
			if(f) adhoc.allNodes[f].references.push(newNode.id);
		}

		// Register actions for later use
		if(w == adhoc.nodeWhich.ACTION_DEFIN){
			adhoc.registeredActions.push(newNode);
		}

		// Give this node empty children as necessary
		if(!(w==adhoc.nodeWhich.VARIABLE_ASIGN && p && p.which!=adhoc.nodeWhich.ACTION_DEFIN)){
			var neededChildren = adhoc.nodeWhichChildren[t][adhoc.nodeWhichIndices[w][1]];
			for(var i=0; i<neededChildren.length; ++i){
				for(var j=0; j<neededChildren[i].min; ++j){
					adhoc.createNode(
						null
						,newNode
						,null
						,adhoc.nodeTypes.TYPE_NULL
						,adhoc.nodeWhich.WHICH_NULL
						,neededChildren[i].childType
					);
				}
			}
		}

		// Record the addition and refresh the canvas
		if(p && t!=adhoc.nodeTypes.TYPE_NULL){
			adhoc.history.record('add', newNode.id, p);
			adhoc.refreshRender();
		}

		// Return the new node
		return newNode;
	}

	// When the screen size changes, we have to resize the canvas too
	adhoc.sizeCanvas = function(){
		var workspace = $('workspace');
		adhoc.canvas.setAttribute('width', workspace.getWidth()*0.8);
		adhoc.canvas.setAttribute('height', workspace.getHeight());
		adhoc.refreshRender();
	}
	// Re-compute all the node locations and redraw those that are on-screen
	adhoc.refreshRender = function(){
		if(!adhoc.rootNode) return;
		var ctx = adhoc.canvas.getContext('2d');
		ctx.clearRect(0, 0, adhoc.canvas.width, adhoc.canvas.height);
		adhoc.subTreeHeightNode(adhoc.rootNode);
		adhoc.positionNode(adhoc.rootNode, 0);
		adhoc.renderNode(adhoc.rootNode);
	}

	// Recursively determine the display heights of each subtree
	adhoc.subTreeHeightNode = function(n){
		n.subTreeHeight = (n.nodeType==adhoc.nodeTypes.GROUP ? 30 : 0);
		var childrenFound = false;
		for(var i=0; i<n.children.length; ++i){
			// Skip null placeholders when setting is disabled
			if(n.children[i].nodeType==adhoc.nodeTypes.TYPE_NULL
					&& !adhoc.setting('showNullNodes')
					&& !adhoc.setting('dbg'))
				continue;

			// Skip any detached nodes
			if(n.children[i].detached){
				adhoc.subTreeHeightNode(n.children[i]);
				continue;
			}

			childrenFound = true;
			n.subTreeHeight += adhoc.subTreeHeightNode(n.children[i]);
		}
		if(!childrenFound) n.subTreeHeight = (n.nodeType==adhoc.nodeTypes.GROUP ? 30 : 100);
		return n.subTreeHeight;
	}
	// Recursively determine each node's display position
	adhoc.positionNode = function(n, d, m){
		var passed = d ? n.y : 0;
		n.x = d*200 + 100 + (m ? adhoc.movingNode.movePos.x : 0);
		n.y = n.subTreeHeight/2 + passed + (m ? adhoc.movingNode.movePos.y : 0);
		for(var i=0; i<n.children.length; ++i){
			// Skip null placeholders when setting is disabled
			if(n.children[i].nodeType==adhoc.nodeTypes.TYPE_NULL
					&& !adhoc.setting('showNullNodes')
					&& !adhoc.setting('dbg'))
				continue;

			// Figure out how much vertical space has passed
			n.children[i].y = passed;
			if(!n.children[i].detached) passed += n.children[i].subTreeHeight;
			adhoc.positionNode(
				n.children[i]
				,d + (n.nodeType==adhoc.nodeTypes.GROUP?0:1)
				,(m||n.detached) ? true : false
			);
		}
	}

	// Recursively draw each node
	adhoc.renderNode = function(n){
		// Process the children recursively
		var c, maxWidth=30;
		for(var i=0; i<n.children.length; ++i){
			// Render one child
			c = n.children[i];

			// Skip null placeholders when setting is disabled
			if(c.nodeType==adhoc.nodeTypes.TYPE_NULL
					&& !adhoc.setting('showNullNodes')
					&& !adhoc.setting('dbg'))
				continue;

			adhoc.renderNode(c);
			if(c.width > maxWidth) maxWidth = c.width;
		}

		// Rest canvas parameters
		var ctx = adhoc.canvas.getContext('2d');
		var nodeColor;
		ctx.lineWidth = (6.0*adhoc.display_scale)<<0;
		ctx.font = ((20.0*adhoc.display_scale)<<0)+'px Arial';
		ctx.fillStyle = adhoc.setting('colorScheme')=='dark' ? adhoc.textColorDark : adhoc.textColor;
		if(n.selected){
			ctx.setLineDash([3*adhoc.display_scale, 3*adhoc.display_scale]);
		}

		// Calculate drag-and-drop offset
		n.x += n.movePos.x;
		n.y += n.movePos.y;

		// Display different node types
		switch(n.nodeType){
		case adhoc.nodeTypes.TYPE_NULL:
			nodeColor = '#989898';
			ctx.strokeStyle = nodeColor;
			n.width = 70;
			n.height = 70;
			ctx.strokeRect(
				(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,(n.y-(n.height/2.0)) * adhoc.display_scale - adhoc.display_y
				,n.width * adhoc.display_scale
				,n.height * adhoc.display_scale
			);
			break;

		case adhoc.nodeTypes.ACTION:
			// Determine the right color
			nodeColor = (n.which == adhoc.nodeWhich.ACTION_DEFIN ? '#87FF00' : '#5FD7FF');

			// Get label text and its size
			var title = n.name;
			if(title.length > 20) title = title.substr(0, 18)+'...';
			var size = ctx.measureText(title);
			size.height = 20;
			n.width = size.width/adhoc.display_scale + 30;
			n.height = size.height + 50;

			// Print label text
			ctx.fillText(
				title
				,(n.x-(size.width/(2.0*adhoc.display_scale))) * adhoc.display_scale - adhoc.display_x
				,(n.y+(size.height/2.0)-3) * adhoc.display_scale - adhoc.display_y
			);

			// Draw box border
			ctx.strokeStyle = nodeColor;
			ctx.strokeRect(
				(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,(n.y-(n.height/2.0)) * adhoc.display_scale - adhoc.display_y
				,n.width * adhoc.display_scale
				,n.height * adhoc.display_scale
			);
			break;

		case adhoc.nodeTypes.GROUP:
			// Determine the right color
			nodeColor = '#8A8A8A';

			// Set the group's dimensions by the size of its subtree
			n.width = maxWidth + 10;
			n.height = n.subTreeHeight + 10;

			// Draw box border
			ctx.strokeStyle = nodeColor;
			if(!n.selected){
				ctx.setLineDash([10*adhoc.display_scale, 7*adhoc.display_scale]);
			}
			ctx.strokeRect(
				(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,(n.y-(n.height/2.0)) * adhoc.display_scale - adhoc.display_y
				,n.width * adhoc.display_scale
				,n.height * adhoc.display_scale
			);
			ctx.setLineDash([]);
			break;

		case adhoc.nodeTypes.CONTROL:
			// Determine the right color
			nodeColor = '#D7005F';

			// Get label text and its size
			var title = adhoc.nodeWhichNames[adhoc.nodeTypes.CONTROL][n.which - adhoc.nodeWhich.CONTROL_IF][0];
			var size, textSize = (20*adhoc.display_scale)<<0;
			n.width = 87;
			n.height = 100;
			do{
				size = ctx.measureText(title);
				if((size.width/adhoc.display_scale)+15 < n.width) break;
				ctx.font = "" + (--textSize) + "px Arial";
			}while(true);
			size.height = 20;

			// Print label text
			ctx.fillText(
				title
				,(n.x-(size.width/(2.0*adhoc.display_scale))-5) * adhoc.display_scale - adhoc.display_x
				,(n.y+(size.height/2.0)-3) * adhoc.display_scale - adhoc.display_y
			);

			// Draw triangle border
			ctx.strokeStyle = nodeColor;
			ctx.beginPath();
			ctx.moveTo(
				(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,n.y * adhoc.display_scale - adhoc.display_y
			);
			ctx.lineTo(
				(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,(n.y-(n.height/2.0)) * adhoc.display_scale - adhoc.display_y
			);
			ctx.lineTo(
				(n.x+(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,n.y * adhoc.display_scale - adhoc.display_y
			);
			ctx.lineTo(
				(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,(n.y+(n.height/2.0)) * adhoc.display_scale - adhoc.display_y
			);
			ctx.lineTo(
				(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,n.y * adhoc.display_scale - adhoc.display_y
			);
			ctx.stroke();
			break;

		case adhoc.nodeTypes.OPERATOR:
		case adhoc.nodeTypes.ASSIGNMENT:
			// Determine the right color
			nodeColor = '#AF5FFF';
			ctx.font = ((32.0*adhoc.display_scale)<<0)+'px Arial';

			// Get label text and its size
			var offset = (n.nodeType == adhoc.nodeTypes.OPERATOR)
				? adhoc.nodeWhich.OPERATOR_PLUS
				: adhoc.nodeWhich.ASSIGNMENT_INCPR;
			var title = adhoc.nodeWhichNames[n.nodeType][n.which-offset][1];
			var size = ctx.measureText(title);
			size.height = 20;
			n.width = 80;
			n.height = 80;

			// Print label text
			ctx.fillText(
				title
				,(n.x-(size.width/(2.0*adhoc.display_scale))) * adhoc.display_scale - adhoc.display_x
				,(n.y+(size.height/2.0)) * adhoc.display_scale - adhoc.display_y
			);

			// Draw box border
			ctx.strokeStyle = nodeColor;
			ctx.beginPath();
			ctx.arc(
				n.x * adhoc.display_scale - adhoc.display_x
				,n.y * adhoc.display_scale - adhoc.display_y
				,(n.width/2.0) * adhoc.display_scale
				,0
				,Math.PI*2
			);
			ctx.stroke();
			break;

		case adhoc.nodeTypes.VARIABLE:
			// Get label text and its size
			nodeColor = adhoc.setting('colorScheme')=='dark' ? adhoc.textColorDark : adhoc.textColor;
			var title = n.name;
			if(title.length > 20) title = title.substr(0, 18)+'...';
			var size = ctx.measureText(title);
			size.height = 20;
			n.width = size.width + 30;
			n.height = size.height + 50;

			// Print label text
			ctx.fillText(
				title
				,(n.x-(size.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,(n.y+(size.height/2.0)-3) * adhoc.display_scale - adhoc.display_y
			);
			break;

		case adhoc.nodeTypes.LITERAL:
			nodeColor = '#FF8700';
			ctx.fillStyle = '#FF8700';
			switch(n.which){
			case adhoc.nodeWhich.LITERAL_BOOL:
				// Get label text and its size
				var title = (n.value ? "true" : "false");
				var size = ctx.measureText(title);
				size.height = 20;
				n.width = size.width + 30;
				n.height = size.height + 80;

				// Print label text
				ctx.fillText(
					title
					,(n.x-(n.width/2.0)+15) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0)-40) * adhoc.display_scale - adhoc.display_y
				);
				break;

			case adhoc.nodeWhich.LITERAL_INT:
			case adhoc.nodeWhich.LITERAL_FLOAT:
			case adhoc.nodeWhich.LITERAL_STRNG:
				// Get label text and its size
				var title = n.value;
				if(n.which==adhoc.nodeWhich.LITERAL_FLOAT && title==(title<<0)) title = title+'.0';
				if(title.length > 20) title = title.substr(0, 18)+'...';
				if(n.which == adhoc.nodeWhich.LITERAL_STRNG) title = '"'+title+'"'
				var size = ctx.measureText(title);
				size.height = 20;
				n.width = size.width + 30;
				n.height = size.height + 80;

				// Print label text
				ctx.fillText(
					title
					,(n.x-(n.width/2.0)+15) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0)-50) * adhoc.display_scale - adhoc.display_y
				);
				break;

			case adhoc.nodeWhich.LITERAL_ARRAY:
				// Set the node's dimensions
				n.width = 100;
				n.height = 100;

				// Darw the items
				// TODO: draw shorthand for array items

				// Draw the brackets
				ctx.strokeStyle = '#000000';
				ctx.beginPath();
				ctx.moveTo(
					(n.x-(n.width/2.0+5)) * adhoc.display_scale - adhoc.display_x
					,(n.y-(n.height/2.0+5)+10) * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x-(n.width/2.0+5)) * adhoc.display_scale - adhoc.display_x
					,(n.y-(n.height/2.0+5)) * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x+(n.width/2.0+5)) * adhoc.display_scale - adhoc.display_x
					,(n.y-(n.height/2.0+5)) * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x+(n.width/2.0+5)) * adhoc.display_scale - adhoc.display_x
					,(n.y-(n.height/2.0+5)+10) * adhoc.display_scale - adhoc.display_y
				);
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(
					(n.x-(n.width/2.0+5)) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0+5)-10) * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x-(n.width/2.0+5)) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0+5)) * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x+(n.width/2.0+5)) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0+5)) * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x+(n.width/2.0+5)) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0+5)-10) * adhoc.display_scale - adhoc.display_y
				);
				ctx.stroke();
				break;

			case adhoc.nodeWhich.LITERAL_HASH:
				// TODO: render a literal hash
				break;

			case adhoc.nodeWhich.LITERAL_STRCT:
				// TODO: render a literal struct
				break;

			}
			break;
		}

		// Process the child connectors recursively
		for(var i=0; i<n.children.length; ++i){
			// Draw a connecting arrow except for groups
			if(n.nodeType == adhoc.nodeTypes.GROUP) continue;
			c = n.children[i];

			// Skip null placeholders when setting is disabled
			if(c.nodeType==adhoc.nodeTypes.TYPE_NULL
					&& !adhoc.setting('showNullNodes')
					&& !adhoc.setting('dbg'))
				continue;

			// Skip child if detached
			if(c.detached) continue;

			ctx.strokeStyle = nodeColor;
			ctx.beginPath();
			var arrowFrom = [
				(n.x+(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,n.y * adhoc.display_scale - adhoc.display_y
			]
			,arrowTo = [
				(c.x-(c.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,c.y * adhoc.display_scale - adhoc.display_y
			]
			,arrowCenter = [
				(arrowFrom[0]+arrowTo[0])/2.0
				, (arrowFrom[1]+arrowTo[1])/2.0
			]
			ctx.moveTo(arrowFrom[0], arrowFrom[1]);
			ctx.lineTo(arrowTo[0], arrowTo[1]);
			ctx.stroke();

			// Label the connector for certain child types
			var childInfo = adhoc.nodeChildTypeInfo[c.childType];
			var labelSetting = adhoc.setting('labelConnectors');
			if(adhoc.setting('dbg')) labelSetting=2;
			if(labelSetting && (labelSetting==2 || childInfo.useLabel)){
				ctx.font = "" + (14*adhoc.display_scale) + "px Arial";
				var rise = arrowTo[1] - arrowFrom[1];
				var run = arrowTo[0] - arrowFrom[0];
				ctx.save();
				ctx.translate(arrowCenter[0], arrowCenter[1]-5);
				ctx.rotate(Math.atan(rise/run));
				ctx.textAlign = "center";
				ctx.fillStyle = nodeColor;
				ctx.fillText(childInfo.label, 0, 0);
				ctx.restore();
			}
		}

		// In debug mode, show the node's package
		if(adhoc.setting('dbg')
				|| n.nodeType == adhoc.nodeTypes.ACTION
				|| n.nodeType == adhoc.nodeTypes.VARIABLE){
			ctx.strokeStyle = nodeColor;
			ctx.fillStyle = adhoc.setting('colorScheme')=='dark' ? adhoc.textColorDark : adhoc.textColor;
			ctx.lineWidth = (2.0*adhoc.display_scale)<<0;
			ctx.font = ((12.0*adhoc.display_scale)<<0)+'px Arial';
			var size = ctx.measureText(n.package);
			ctx.fillText(
				n.package
				,(n.x-(n.width/2.0)+5) * adhoc.display_scale - adhoc.display_x
				,(n.y-(n.height/2.0)+16) * adhoc.display_scale - adhoc.display_y
			);
			ctx.strokeRect(
				(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,(n.y-(n.height/2.0)) * adhoc.display_scale - adhoc.display_y
				,(size.width+10) * adhoc.display_scale
				,20 * adhoc.display_scale
			);
		}

		// In debug mode, show the node's ID
		if(adhoc.setting('dbg')){
			ctx.strokeStyle = nodeColor;
			ctx.fillStyle = adhoc.setting('colorScheme')=='dark' ? adhoc.textColorDark : adhoc.textColor;
			ctx.lineWidth = (2.0*adhoc.display_scale)<<0;
			ctx.font = ((12.0*adhoc.display_scale)<<0)+'px Arial';
			var size = ctx.measureText(n.id);
			ctx.fillText(
				n.id
				,(n.x+(n.width/2.0)-(size.width+5)) * adhoc.display_scale - adhoc.display_x
				,(n.y+(n.height/2.0)-6) * adhoc.display_scale - adhoc.display_y
			);
			ctx.strokeRect(
				(n.x+(n.width/2.0)-(size.width+10)) * adhoc.display_scale - adhoc.display_x
				,(n.y+(n.height/2.0)-20) * adhoc.display_scale - adhoc.display_y
				,(size.width+10) * adhoc.display_scale
				,20 * adhoc.display_scale
			);
		}

		// Reset line dashes
		ctx.setLineDash([]);

		// Handle node error messages
		if(n.error){
			ctx.lineWidth = (6.0*adhoc.display_scale)<<0;
			ctx.strokeStyle = adhoc.setting('colorScheme')=='dark' ? '#FF0000' : '#FF0000';
			ctx.strokeRect(
				(n.x-(n.width/2.0)-7) * adhoc.display_scale - adhoc.display_x
				,(n.y-(n.height/2.0)-7) * adhoc.display_scale - adhoc.display_y
				,(n.width+14) * adhoc.display_scale
				,(n.height+14) * adhoc.display_scale
			);
		}

		// Handle node highlighting
		if(n.highlighted){
			ctx.lineWidth = (6.0*adhoc.display_scale)<<0;
			ctx.strokeStyle = adhoc.setting('colorScheme')=='dark' ? '#FFFF00' : '#FFFF00';
			ctx.strokeRect(
				(n.x-(n.width/2.0)-7) * adhoc.display_scale - adhoc.display_x
				,(n.y-(n.height/2.0)-7) * adhoc.display_scale - adhoc.display_y
				,(n.width+14) * adhoc.display_scale
				,(n.height+14) * adhoc.display_scale
			);
		}

		// Reset the moving position
		n.x -= n.movePos.x;
		n.y -= n.movePos.y;
	}

	// Recursively determine whether the click landed in a node
	adhoc.getClickedNode = function(n, click){
		// Check the children
		for(var i=0; i<n.children.length; ++i){
			var temp = adhoc.getClickedNode(n.children[i], click);
			if(temp) return temp;
		}

		// See if it's in this node
		if(click.x >= n.x-(n.width/2.0)
				&& click.x <= n.x+(n.width/2.0)
				&& click.y >= n.y-(n.height/2.0)
				&& click.y <= n.y+(n.height/2.0)
			) return n;

		// If we've gotten here, then the click was on the canvas
		return null;
	}
	// Recursively determine which node (if any) the click landed near
	adhoc.getClosestNode = function(n, best, click){
		// Skip detached blocks
		if(!n.detached){
			// Get the distance of this node
			var dist = Math.min(Math.abs(click.x-n.x)-(n.width/2.0), Math.abs(click.y-n.y)-(n.height/2.0));
			if(dist < best[1]){
				best[0] = n;
				best[1] = dist;
			}

			// Check the children
			for(var i=0; i<n.children.length; ++i){
				best = adhoc.getClosestNode(n.children[i], best, click);
			}
		}

		// Return the best found
		return best;
	}
	// Function to detach a node from its parent
	adhoc.detachNode = function(click, n){
		// Can't move the root node
		if(n == adhoc.rootNode) return;

		// Begin the detached state
		adhoc.movingNode = n;
		adhoc.movingNode.detached = true;
		adhoc.movingNode.moveClick = click;
		adhoc.movingNode.movePos = {
			x: 0
			,y: 0
		};
		adhoc.movingNode.moveTarget = adhoc.movingNode.parent;
		adhoc.movingNode.moveTarget.highlighted = true;
	}
	// Function to attach a node to a (possibly new) parent
	adhoc.reattachNode = function(click){
		// If no detached node, return
		if(!adhoc.movingNode) return;

		// One final position update
		adhoc.moveDetachedNode(click);

		// If there's a move target
		if(adhoc.movingNode.moveTarget){
			// Function to do the move if child types check out
			function moveNodeWithType(childType){
				adhoc.history.record(
					'move'
					,[adhoc.movingNode.moveTarget.id, childType]
					,adhoc.movingNode
				);
				adhoc.movingNode.childType = childType;
				adhoc.moveNode(adhoc.movingNode, adhoc.movingNode.parent, adhoc.movingNode.moveTarget);
				adhoc.refreshRender();
			}

			// Get the child roles this node can fill
			var prnt = adhoc.movingNode.moveTarget;
			var type = adhoc.movingNode.nodeType;
			var which = adhoc.movingNode.which;
			var neededChildren = adhoc.nodeWhichChildren[prnt.nodeType][adhoc.nodeWhichIndices[prnt.which][1]];
			var roleOptions = [];
			var roleOptionNames = [];
			var someOk = false;
			// Loop over the types of children the parent needs
			for(var i=0; i<neededChildren.length; ++i){
				var role = neededChildren[i];
				// Skip if the child's type is not allowed
				if(adhoc.nodeChildTypeInfo[role.childType].nodeTypes.indexOf(type) < 0) continue;
				// Skip if the child's sub-type is not allowed
				if(adhoc.nodeChildTypeInfo[role.childType].nodeNotWhich.indexOf(which) >= 0) continue;
				// The child type is allowed for at least one role
				someOk = true;
				// Skip if the parent has already maxed the child's type
				if(role.max!=null && adhoc.countChildrenOfType(prnt, role.childType, true) >= role.max) continue;

				// If we make it here, the child type is viable
				roleOptions.push(role.childType);
				roleOptionNames.push(adhoc.nodeChildTypeInfo[role.childType].label);
			}

			// Report errors if there are no roles available
			if(!roleOptions.length){
				var parentName = adhoc.nodeWhichNames[adhoc.nodeWhichIndices[prnt.which][0]][adhoc.nodeWhichIndices[prnt.which][1]][0];
				var childName = adhoc.nodeWhichNames[type][adhoc.nodeWhichIndices[which][1]][0];
				adhoc.error(someOk
					? "The parent node cannot directly hold any more children of this type."
					: "A '"+parentName+"' node cannot hold a '"+childName+"' node directly."
				);

			// If no errors, but only one option, then just use that
			}else if(roleOptions.length == 1){
				moveNodeWithType(roleOptions[0]);

			// If multiple roles available, prompt for which role will be filled
			}else{
				// Prompt for which child-type to use
				adhoc.promptFlag('Select a role for the new node:', roleOptionNames, function(val){
					moveNodeWithType(roleOptions[val]);

					// End the attached state
					adhoc.movingNode.moveTarget.highlighted = false;
					adhoc.movingNode.moveTarget = null;
					adhoc.movingNode.detached = false;
					adhoc.movingNode.moveClick = null;
					adhoc.movingNode.movePos = {
						x: 0
						,y: 0
					};
					adhoc.movingNode = null;
					adhoc.refreshRender();
				});
				return;
			}
		}

		// End the attached state
		adhoc.movingNode.moveTarget.highlighted = false;
		adhoc.movingNode.moveTarget = null;
		adhoc.movingNode.detached = false;
		adhoc.movingNode.moveClick = null;
		adhoc.movingNode.movePos = {
			x: 0
			,y: 0
		};
		adhoc.movingNode = null;
		adhoc.refreshRender();
	}
	// Function to move a detached node on the canvas
	adhoc.moveDetachedNode = function(click){
		// If no detached node, return
		if(!adhoc.movingNode) return;

		// Update the position and find the new target
		adhoc.movingNode.movePos.x = click.x - adhoc.movingNode.moveClick.x;
		adhoc.movingNode.movePos.y = click.y - adhoc.movingNode.moveClick.y;
		if(adhoc.movingNode.moveTarget) adhoc.movingNode.moveTarget.highlighted = false;
		adhoc.movingNode.moveTarget = adhoc.getClosestNode(adhoc.rootNode, [adhoc.rootNode, Infinity], click)[0];
		if(adhoc.movingNode.moveTarget) adhoc.movingNode.moveTarget.highlighted = true;
		adhoc.refreshRender();
	}
	// Pans the canvas to the specified node
	adhoc.snapToNode = function(n){
		adhoc.display_x = (n.x + n.width/2.0)*adhoc.display_scale - parseInt(adhoc.canvas.getAttribute('width'))/2.0;
		adhoc.display_y = (n.y + n.height/2.0)*adhoc.display_scale - parseInt(adhoc.canvas.getAttribute('height'))/2.0;
	}

	// Generate a function to find variables by name in a given scope
	adhoc.genScopeSearch = function(scope, exact){
		// Create a search function to return
		return function(part){
			// Keep a local copy of the context
			var myScope = scope;
			// Create an empty list of variables to return
			var out = [];

			// Traverse up the scope lineage
			while(myScope){
				// Search the variables in scope
				for(i=0; i<myScope.scopeVars.length; ++i){
					// If they match, add them into the output array
					var n = myScope.scopeVars[i].name;
					if(n.indexOf(part)===0 && (!exact || n.length==part.length)){
						out.push({
							value: n
							,reminder: myScope.name
							,hidden: myScope.scopeVars[i].id
						});
					}
				}

				// Move to the parent scope
				myScope = myScope.parent;
			}

			// Return the final list
			return out;
		};
	}
	// Find actions by name
	adhoc.actionSearch = function(part, exact, packageOnly){
		// Create an empty list of actions to return
		var out = [];

		// Search registered actions first
		for(var i=0; i<adhoc.registeredActions.length; ++i){
			// If one matches, add it to the output array
			var n = adhoc.registeredActions[i].name;
			if((exact && n==part) || (!exact && n.indexOf(part)===0)){
				out.push({
					value: n
					,reminder: adhoc.registeredActions[i].package
					,hidden: adhoc.registeredActions[i].id
				});
			}
		}
		// If only checking package, return early
		if(packageOnly) return out;

		// Then search system actions
		for(var i=0; i<adhoc.systemActions.length; ++i){
			// If one matches, add it to the output array
			var n = adhoc.systemActions[i].name;
			if((exact && n==part) || (!exact && n.indexOf(part)===0)){
				out.push({
					value: n
					,reminder: 'System'
					,hidden: null
				});
			}
		}

		// Return the final list
		return out;
	}
	// Check how many children of a particular type some parent has
	adhoc.countChildrenOfType = function(prnt, childType, skipNull){
		var count = 0;
		for(var i=0; i<prnt.children.length; ++i){
			if(prnt.children[i].nodeType == adhoc.nodeTypes.TYPE_NULL && skipNull) continue;
			if(prnt.children[i].childType == childType) ++count;
		}
		return count;
	}
	// Get the first null child of a certain type
	adhoc.getFirstNullChildByType = function(prnt, childType){
		for(var i=0; i<prnt.children.length; ++i){
			if(prnt.children[i].nodeType==adhoc.nodeTypes.TYPE_NULL
					&& prnt.children[i].childType==childType) return prnt.children[i];
		}
		return null;
	}
	// Clear error markings from a node and its children
	adhoc.clearErrors = function(n){
		if(!n) return;
		n.error = null;
		for(var i=0; i<n.children.length; ++i) adhoc.clearErrors(n.children[i]);
	}

	// Function to serialize a node and its children for binary
	adhoc.serialize = function(n){
		var out =
			adhoc.intTo3Byte(n.id)
			+ adhoc.intTo3Byte(n.parent ? n.parent.id : 0)
			+ adhoc.intTo3Byte(n.nodeType)
			+ adhoc.intTo3Byte(n.which)
			+ adhoc.intTo3Byte(n.childType)
			+ '"' + (n.package ? n.package : 'NULL') + '"'
			+ '"' + (n.name ? n.name : 'NULL') + '"'
			+ '"' + (n.value ? n.value : 'NULL') + '"';
		for(var i=0; i<n.children.length; ++i){
			out += adhoc.serialize(n.children[i]);
		}
		return out;
	}
	// Function to unserialize binary into a node
	adhoc.unserialize = function(s){
		// Get the node parts from the input string
		var tempNode = {};
		tempNode.id = adhoc.intFrom3Byte(s.substr(0, 3));
		tempNode.parentId = adhoc.intFrom3Byte(s.substr(3, 3));
		tempNode.nodeType = adhoc.intFrom3Byte(s.substr(6, 3));
		tempNode.which = adhoc.intFrom3Byte(s.substr(9, 3));
		tempNode.childType = adhoc.intFrom3Byte(s.substr(12, 3));
		var found = 1;
		var offset = 16;
		while(found<6){
			offset = s.indexOf('"', offset+1);
			if(s.charAt(offset-1) == "\\") continue;
			++found;
		}
		var parts = s.substring(16, offset).split('""');
		tempNode.package = (parts[0]=="NULL" ? null : parts[0]);
		tempNode.name = (parts[1]=="NULL" ? null : parts[1]);
		tempNode.value = (parts[2]=="NULL" ? null : parts[2]);

		// Create a new node from the parts
		var newNode = adhoc.createNode(
			tempNode.id
			,tempNode.parentId ? adhoc.allNodes[tempNode.parentId] : null
			,null
			,tempNode.nodeType
			,tempNode.which
			,tempNode.childType
			,tempNode.package
			,tempNode.name
			,tempNode.value
			//,f  // Reference Id
		);
		adhoc.lastId = Math.max(newNode.id+1, adhoc.lastId);

		// Continue until we've exhaused the string
		s = s.substr(offset+1);
		if(!s) return newNode;
		adhoc.unserialize(s);
		return newNode;
	}
	// Function to serialize a node and its children for the history manager
	adhoc.serializeComplete = function(n, deep){
		var out = {
			id: n.id
			,parentId: (n.parent ? n.parent.id : null)
			,scopeId: (n.scope ? n.scope.id : null)
			,referenceId: n.referenceId
			,nodeType: n.nodeType
			,which: n.which
			,childType: n.childType
			,dataType: n.dataType
			,package: n.package
			,name: n.name
			,value: n.value
			,childIds: []
			,references: n.references
			,x: n.x
			,y: n.y
			,highlighted: n.highlighted
			,detached: n.false
			,moveClick: n.null
			,moveTarget: n.null
			,movePos: {x:0,y:0}
			,width: n.width
			,height: n.height
			,subTreeHeight: n.subTreeHeight
		};
		var children = [];
		for(var i=0; i<n.children.length; ++i){
			out.childIds.push(n.children[i].id);
			if(deep) children.push(adhoc.serializeComplete(n.children[i], deep));
		}
		return {
			data: Object.toJSON(out)
			,children: children
		};
	}

	// Renames a single node
	adhoc.renameNode = function(n, pkg, name, ref, recursive){
		// Default the package name to the current package
		pkg = pkg || adhoc.setting('projectName');

		// Keep references to integers
		ref = ref ? parseInt(ref) : null;

		// If given a new reference
		if(n.referenceId != ref){
			// Remove node from current reference
			if(n.referenceId && adhoc.allNodes[n.referenceId]){
				adhoc.allNodes[n.referenceId].references.splice(
					adhoc.allNodes[n.referenceId].references.indexOf(n.id)
					,1
				);
			}

			// Add to new reference
			if(ref && adhoc.allNodes[ref]){
				adhoc.allNodes[ref].references.push(n.id);
				n.scope = adhoc.allNodes[ref].scope;

			// If there's no reference (new variable name), assign a scope
			}else if(n.which == adhoc.nodeWhich.VARIABLE_ASIGN){
				var searchFunc = adhoc.genScopeSearch(n.parent, true);
				if(!searchFunc(n.name).length){
					n.scope = n.parent;
					while(n.scope.which != adhoc.nodeWhich.ACTION_DEFIN
							&& n.scope.which != adhoc.nodeWhich.CONTROL_LOOP){
						n.scope = n.scope.parent;
					}
					n.scope.scopeVars.push(n);
				}
			}
		}

		// Update this node
		n.package = pkg;
		n.name = name;

		// Update references to this node
		for(var i=0; i<n.references.length; ++i){
			adhoc.history.record('rename', n.id, adhoc.allNodes[n.references[i]], true);
			adhoc.renameNode(adhoc.allNodes[n.references[i]], pkg, name, n.id, true);
		}
	}
	// Changes the package name of all children
	adhoc.updatePackageName = function(n, oldP, newP){
		if(n.package == newP) return;
		if(n.package == oldP) n.package = newP;
		for(var i=0; i<n.children.length; ++i){
			adhoc.updatePackageName(n.children[i], oldP, newP);
		}
		for(var i=0; i<n.references.length; ++i){
			adhoc.updatePackageName(n.references[i], oldP, newP);
		}
	}
	// Moves a node from one parent to another
	adhoc.moveNode = function(n, p1, p2){
		// Remove this node from its old parent and scope
		if(p1){
			// Remove from the parent and replace with a placeholder as needed
			p1.children.splice(p1.children.indexOf(n), 1);
			var pType = p1.nodeType;
			var pWhich = adhoc.nodeWhichIndices[p1.which][1];
			var neededChildren = adhoc.nodeWhichChildren[pType][pWhich];
			for(var i=0; i<neededChildren.length; ++i){
				if(neededChildren[i].childType != n.childType) continue;
				if(adhoc.countChildrenOfType(p1, n.childType) < neededChildren[i].min){
					adhoc.createNode(
						null
						,p1
						,null
						,adhoc.nodeTypes.TYPE_NULL
						,adhoc.nodeWhich.WHICH_NULL
						,neededChildren[i].childType
					);
				}
				break;
			}
			if(n.scope){
				n.scope.scopeVars.splice(n.scope.scopeVars.indexOf(n), 1);
			}
		}

		// Add to the new parent (assume validity has been checked)
		n.parent = p2;
		var r = adhoc.getFirstNullChildByType(p2, n.childType);
		// Replace null if possible
		if(r) p2.children[p2.children.indexOf(r)] = n;
		// Otherwise, find proper location
		else{
			var pp=0
				,pc=0
				,reached=false
				,neededChildren=adhoc.nodeWhichChildren[p2.nodeType][adhoc.nodeWhichIndices[p2.which][1]]
				;
			while(true){
				if(pc >= p2.children.length){
					p2.children.push(n);
					break;
				}
				if(neededChildren[pp].childType == n.childType){
					reached = true;
				}
				if(neededChildren[pp].childType == p2.children[pc].childType){
					++pc;
					continue;
				}
				if(!reached){
					++pp;
					continue;
				}
				p2.children.splice(pc, 0, n);
				break;
			}
		}

		// If a variable, and not a reference, assign to the appropriate scope
		if(n.which == adhoc.nodeWhich.VARIABLE_ASIGN && !n.referenceId){
			var searchFunc = adhoc.genScopeSearch(p2, true);
			if(!searchFunc(n.name).length){
				var scope = p2;
				while(scope.which != adhoc.nodeWhich.ACTION_DEFIN
						&& scope.which != adhoc.nodeWhich.CONTROL_LOOP){
					scope = scope.parent;
				}
				scope.scopeVars.push(n);
			}
		}
	}
	// Deletes one node and its children
	adhoc.deleteNode = function(n){
		// Call on the children first
		for(var i=n.children.length-1; i>=0; --i){
			if(!n.children[i] || n.children[i].nodeType==adhoc.nodeTypes.TYPE_NULL) continue;
			adhoc.deleteNode(n.children[i]);
		}

		// Remove this node from its parent, scope, and references
		if(n.parent){
			// Remove from the parent and replace with a placeholder as needed
			n.parent.children.splice(n.parent.children.indexOf(n), 1);
			var pType = n.parent.nodeType;
			var pWhich = adhoc.nodeWhichIndices[n.parent.which][1];
			var neededChildren = adhoc.nodeWhichChildren[pType][pWhich];
			for(var i=0; i<neededChildren.length; ++i){
				if(neededChildren[i].childType != n.childType) continue;
				if(adhoc.countChildrenOfType(n.parent, n.childType) < neededChildren[i].min){
					adhoc.createNode(
						null
						,n.parent
						,null
						,adhoc.nodeTypes.TYPE_NULL
						,adhoc.nodeWhich.WHICH_NULL
						,neededChildren[i].childType
					);
				}
				break;
			}
		}
		if(n.scope){
			n.scope.scopeVars.splice(n.scope.scopeVars.indexOf(n), 1);
		}
		if(n.referenceId && adhoc.allNodes[n.referenceId]){
			adhoc.allNodes[n.referenceId].references.splice(
				adhoc.allNodes[n.referenceId].references.indexOf(n.id)
				,1
			);
		}
		for(var i=0; i<n.references.length; ++i){
			adhoc.allNodes[n.references[i]].referenceId = null;
		}

		// Remove this node from the action registry and the list of all nodes
		if(n.which == adhoc.nodeWhich.ACTION_DEFIN){
			adhoc.registeredActions.splice(adhoc.registeredActions.indexOf(n), 1);
		}
		adhoc.allNodes[n.id] = null;
		return true;
	}
	// Restore a node from a serialized string
	adhoc.restoreNode = function(n, serial){
		// Unwrap the node itself
		var newNode = serial.data.evalJSON();

		// If the node to be restored already exists, then reset its properties
		if(n){
			n.id = newNode.id
			n.parent = adhoc.allNodes[newNode.parentId];
			n.scope = adhoc.allNodes[newNode.scopeId];
			n.referenceId = newNode.referenceId;
			n.nodeType = newNode.nodeType;
			n.which = newNode.which;
			n.childType = newNode.childType;
			n.dataType = newNode.dataType;
			n.package = newNode.package;
			n.name = newNode.name;
			n.value = newNode.value;
			n.references = newNode.references;
			n.x = newNode.x;
			n.y = newNode.y;
			n.highlighted = newNode.highlighted
			n.detached = newNode.detached
			n.moveClick = newNode.moveClick
			n.moveTarget = newNode.moveTarget
			n.movePos = newNode.movePos
			n.width = newNode.width;
			n.height = newNode.height;
			n.subTreeHeight = newNode.subTreeHeight;

			// Add to the list of all nodes and the action registry
			adhoc.allNodes[newNode.id] = n;

			// Restore the node's children
			for(var i=0; i<serial.children.length; ++i){
				adhoc.restoreNode(
					n.children[i]
					,serial.children[i]
				);
			}

		// If it does not exist, rebuild it
		}else{
			n = newNode;

			// Restore the parent
			if(n.parentId){
				n.parent = adhoc.allNodes[n.parentId];
				var pp=0
					,pc=0
					,reached=false
					,neededChildren=adhoc.nodeWhichChildren[n.parent.nodeType][adhoc.nodeWhichIndices[n.parent.which][1]]
					;
				while(true){
					if(pc >= n.parent.children.length){
						n.parent.children.push(n);
						break;
					}
					if(neededChildren[pp].childType == n.childType){
						reached = true;
					}
					if(neededChildren[pp].childType == n.parent.children[pc].childType){
						++pc;
						continue;
					}
					if(!reached){
						++pp;
						continue;
					}
					n.parent.children.splice(pc, 0, n);
					break;
				}
			}

			// Restore the scope
			if(n.scopeId){
				n.scope = adhoc.allNodes[n.scopeId];
				n.scopeVars.push(n);
			}

			// Add to the list of all nodes and the action registry
			adhoc.allNodes[newNode.id] = n;
			if(n.which == adhoc.nodeWhich.ACTION_DEFIN){
				adhoc.registeredActions.push(n);
			}

			// Restore the node's children
			newNode.children = [];
			newNode.scopeVars = [];
			for(var i=0; i<serial.children.length; ++i){
				adhoc.restoreNode(
					adhoc.allNodes[newNode.childIds[i]]
					,serial.children[i]
				);
			}
		}

		// Restore this node as a reference
		var ref = n.referenceId ? adhoc.allNodes[n.referenceId] : null;
		if(ref && ref.references.indexOf(n.id)<0){
			ref.references.push(n.id);
		}
		for(var i=0; i<n.references.length; ++i){
			adhoc.allNodes[n.references[i]].referenceId = n.id;
		}

		// Return the node itself for recursive calls
		return newNode;
	}

	// Save a package to storage
	adhoc.saveProject = function(){
		// Call save from Ajax
		new Ajax.Request('save/', {
			parameters: {
				binary: adhoc.serialize(adhoc.rootNode)
				,projectid: adhoc.setting('projectId')
				,projectname: adhoc.setting('projectName')
				,xsrftoken: $('xsrfToken').innerHTML
			}
			,onFailure: function(t){
				adhoc.error(t.responseText);
			}
			,onSuccess: function(t){
				// Update the 'load' menu with any changes
				adhoc.setting('projectId', t.responseText);
				var projOpt = $$('#projectSelect .nxj_selectOption[data-value='+adhoc.setting('projectId')+']')
				$$('#projectSelect .nxj_selectDisplay').each(function(display){
					display.addClassName('default').update(display.getAttribute('placeholder'));
				});

				// The project is already in the menu
				if(projOpt.length){
					projOpt = projOpt[0];
					projOpt.select('span').each(function(span){
						if(span.hasClassName('projectOption')){
							span.update(adhoc.setting('projectName'));
						}else if(span.hasClassName('projectDate')){
							span.update('Just now');
						}
					});
				// It's a new project
				}else{
					projOpt = $(document.createElement('div'));
					projOpt.addClassName('nxj_selectOption');
					var span1 = $(document.createElement('div').addClassName('projectOption'));
					var span2 = $(document.createElement('div').addClassName('projectDate'));
					span1.update(adhoc.setting('projectName'));
					span2.update('Just now');
					projOpt.appendChild(span1);
					projOpt.appendChild(span2);
				}
				projOpt.setAttribute('data-value', adhoc.setting('projectId'));
				var inner = $$('#projectSelect .nxj_selectInner')[0];
				inner.insertBefore(projOpt, inner.firstChild);

				// Disable the 'save' button until a change is made
				$('savePackageButton').addClassName('disabled');
			}
		});
	}
	// Load a package from storage
	adhoc.loadProject = function(projectId){
		new Ajax.Request('load/', {
			parameters: {
				projectid: projectId
				,xsrftoken: $('xsrfToken').innerHTML
			}
			,onSuccess: function(t){
				adhoc.selectedNode = null;
				adhoc.display_scale = 1.0;
				adhoc.display_x = 0;
				adhoc.display_y = 0;
				adhoc.lastId = 0;
				adhoc.registeredActions = [];
				adhoc.allNodes = [];
				adhoc.rootNode = null;
				adhoc.rootNode = adhoc.unserialize(t.responseText);
				adhoc.setting('projectId', projectId);
				adhoc.setting('projectName', adhoc.rootNode.package);
				$('projectName').value = adhoc.setting('projectName');
				$('savePackageButton').addClassName('disabled');
				adhoc.resetHistory();
				adhoc.refreshRender();
			}
			,onFailure: function(t){
				adhoc.error(t.responseText);
			}
		});
	}
	// Generate code from the current file
	adhoc.generateCode = function(){
		adhoc.clearErrors(adhoc.rootNode);
		new Ajax.Request('generate/', {
			parameters: {
				binary: adhoc.serialize(adhoc.rootNode)
				,language: $F('languageChoice_input')
				,executable: 1
				,dbg: (adhoc.setting('dbg') ? 1 : 0)
				,xsrftoken: $('xsrfToken').innerHTML
			}
			,onFailure: function(t){
				adhoc.error("Request failed.\n\n"+t.responseText);
			}
			,onSuccess: function(t){
				// Parse out the results and display any errors
				var results = t.responseText.evalJSON();
				if(results.error.length){
					// Get the error data
					var erRxp = /\u001B\[([0-9]+;)*[0-9]+m((Error)|(Warning)):\u001B\[([0-9]+;)*[0-9]+m /g;
					var erMsg = results.error.join('<br/>');
					var erStatus = erMsg.match(erRxp)[0].match(/Error|Warning/)[0];
					erMsg = erMsg.replace(erRxp, '');
					adhoc.message(erStatus, erMsg);

					// Highlight error nodes, if they exist
					var errorNode = null;
					if(results.nodeId && (errorNode=adhoc.allNodes[results.nodeId])){
						errorNode.error = erMsg;
						adhoc.snapToNode(errorNode);
					}

					// If the errors are fatal, return;
					if(erStatus == 'Error') return adhoc.refreshRender();
				}
				adhoc.refreshRender();

				// Populate a download link
				$('download_ext').setAttribute('value', results.ext);
				$('download_hash').setAttribute('value', results.hash);
				$('download_rename').setAttribute('value', adhoc.setting('projectName'));

				// Render and highlight the generated code itself
				$('generatedCode').update(results.code);
				$('generatedCode').addClassName(
					'language-'+adhoc.languageHighlightClasses[$F('languageChoice_input')]
				);
				Prism.highlightElement($('generatedCode'));
				$('output').show();
			}
		});
	}

	// Initialize the application
	adhoc.init();
});
