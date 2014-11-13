// Not sure why Prototype doesn't include this...
Event.KEY_CONTROL = 17;
Event.KEY_COMMAND1 = 91;
Event.KEY_COMMAND2 = 93;
Event.KEY_COMMAND3 = 224;
Event.KEY_SPACE = 32;

// Not sure why JavaScript doesn't include this...
String.prototype.ltrim = function(s){
	return this.replace(new RegExp("^"+s+"+"), "");
}
String.prototype.rtrim = function(s){
	return this.replace(new RegExp(s+"+$"), "");
}
String.prototype.trim = function(s){
	return this.ltrim(s).rtrim(s);
}

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
		,beta: false
		,colorScheme: 'light'
		,showNullNodes: true
		,labelConnectors: 1
		,projectId: 0
		,projectName: 'New Project'
		,executable: 1
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
		,INDEX:			10
		,IF:			11
		,ELSE:			12
		,STORAGE:		13
	};
	// AST node dataTypes
	adhoc.nodeDataTypes = {
		VOID:		0
		,BOOL:		1
		,INT:		2
		,FLOAT:		3
		,STRING:	4
		,ARRAY:		5
		,HASH:		6
		,STRUCT:	7
		,ACTION:	8
		,MIXED:		9
	}
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
			['Define Action', 'Action']
			,['Call Action', 'Action']
		]
		,[ // GROUP
			['Serial Group', 'Group']
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
			['Variable', 'Variable']
			,['Variable', 'Variable']
		]
		,[ // LITERAL
			['Boolean', 'Boolean']
			,['Integer', 'Integer']
			,['Float', 'Float']
			,['String', 'String']
			,['Array', 'Array']
			,['Hash', 'Hash']
			,['Struct', 'Struct']
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
				adhoc.nodeTypes.CONTROL
			]
			,nodeNotWhich: [
				adhoc.nodeWhich.CONTROL_IF
				,adhoc.nodeWhich.CONTROL_LOOP
				,adhoc.nodeWhich.CONTROL_SWITCH
				,adhoc.nodeWhich.CONTROL_FORK
				,adhoc.nodeWhich.CONTROL_CNTNU
				,adhoc.nodeWhich.CONTROL_BREAK
				,adhoc.nodeWhich.CONTROL_RETRN
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
		,{label: 'Index'
			,useLabel: false
			,nodeTypes: [
				adhoc.nodeTypes.ACTION
				,adhoc.nodeTypes.OPERATOR
				,adhoc.nodeTypes.ASSIGNMENT
				,adhoc.nodeTypes.VARIABLE
				,adhoc.nodeTypes.LITERAL
			]
			,nodeNotWhich: [
				adhoc.nodeWhich.ACTION_DEFIN
				,adhoc.nodeWhich.OPERATOR_OR
				,adhoc.nodeWhich.OPERATOR_AND
				,adhoc.nodeWhich.OPERATOR_NOT
				,adhoc.nodeWhich.OPERATOR_EQUIV
				,adhoc.nodeWhich.OPERATOR_GRTTN
				,adhoc.nodeWhich.OPERATOR_LESTN
				,adhoc.nodeWhich.OPERATOR_GRTEQ
				,adhoc.nodeWhich.OPERATOR_LESEQ
				,adhoc.nodeWhich.OPERATOR_NOTEQ
				,adhoc.nodeWhich.ASSIGNMENT_INCPR
				,adhoc.nodeWhich.ASSIGNMENT_INCPS
				,adhoc.nodeWhich.ASSIGNMENT_DECPR
				,adhoc.nodeWhich.ASSIGNMENT_DECPS
				,adhoc.nodeWhich.ASSIGNMENT_NEGPR
				,adhoc.nodeWhich.ASSIGNMENT_NEGPS
				,adhoc.nodeWhich.ASSIGNMENT_OR
				,adhoc.nodeWhich.ASSIGNMENT_AND
				,adhoc.nodeWhich.VARIABLE_ASIGN
				,adhoc.nodeWhich.LITERAL_BOOL
				,adhoc.nodeWhich.LITERAL_ARRAY
				,adhoc.nodeWhich.LITERAL_HASH
				,adhoc.nodeWhich.LITERAL_STRCT
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
				,adhoc.nodeTypes.OPERATOR
			]
			,nodeNotWhich: [
				adhoc.nodeWhich.VARIABLE_EVAL
				,adhoc.nodeWhich.OPERATOR_PLUS
				,adhoc.nodeWhich.OPERATOR_MINUS
				,adhoc.nodeWhich.OPERATOR_TIMES
				,adhoc.nodeWhich.OPERATOR_DIVBY
				,adhoc.nodeWhich.OPERATOR_MOD
				,adhoc.nodeWhich.OPERATOR_EXP
				,adhoc.nodeWhich.OPERATOR_OR
				,adhoc.nodeWhich.OPERATOR_AND
				,adhoc.nodeWhich.OPERATOR_NOT
				,adhoc.nodeWhich.OPERATOR_EQUIV
				,adhoc.nodeWhich.OPERATOR_GRTTN
				,adhoc.nodeWhich.OPERATOR_LESTN
				,adhoc.nodeWhich.OPERATOR_GRTEQ
				,adhoc.nodeWhich.OPERATOR_LESEQ
				,adhoc.nodeWhich.OPERATOR_NOTEQ
				,adhoc.nodeWhich.OPERATOR_TRNIF
			]
		}
	];
	// Define the accepted child types of each type/which
	adhoc.nodeWhichChildren = [
		[ // NULL
			[ // WHICH_NULL
			]
			,[ // placeholder for indices... jank, much?
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 1
					,max: 1
				}
			]
			,[ // placeholder for indices... jank, much?
				{
					childType: adhoc.nodeChildType.INDEX
					,min: 0
					,max: null
				}
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
					,min: 0
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
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 0
					,max: null
				}
			]
			,[ // LITERAL_HASH
				{
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 0
					,max: null
				}
			]
			,[ // LITERAL_STRCT
				{
					childType: adhoc.nodeChildType.INDEX
					,min: 0
					,max: null
				}
			]
		]
	];
	// Names of datatypes
	adhoc.nodeDataTypeNames = [
		'Void'
		,'Bool'
		,'Int'
		,'Float'
		,'String'
		,'Array'
		,'Hash'
		,'Struct'
		,'Action'
		,'Mixed'
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
	// Node tags
	adhoc.allTags = {};

	// Convert an int to a 3-byte string
	adhoc.intTo3Byte = function(i){
		var out = String.fromCharCode(i%128);
		i >>= 7;
		out = String.fromCharCode(i%128) + out;
		i >>= 7;
		return String.fromCharCode(i%128) + out;
	}
	// Convert a 3-byte string to an int
	adhoc.intFrom3Byte = function(s){
		return (((s.charCodeAt(0)<<7)+s.charCodeAt(1))<<7)+s.charCodeAt(2);
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
	adhoc.validateActionName = function(v, notExist, emptyOk){
		if(emptyOk && !v) return;
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
	// Validate the name of an action, but allow empty
	adhoc.validateActionNameOrEmpty = function(v){
		return adhoc.validateActionName(v, false, true);
	}
	// Validate the name of a new paclage
	adhoc.validatePackageName = function(v){
		if(!v.match(/^[_a-zA-Z][ _a-zA-Z0-9]*$/)){
			return 'Not a valid package name';
		}
	};
	// Validate a comma-separated string of tags
	adhoc.validateTagsString = function(s){
		var tags = s.split(',');
		for(var i=tags.length-1; i>=0; --i){
			if(!tags[i].trim("\\s").match(/^[A-Za-z0-9 _]*$/))
				return "Letters, numbers, spaces, and underscores only";
		}
		return false;
	}
	// Validate action comment text
	adhoc.validateComment = function(v){
		if(v.length>0 && v.length<4){
			return 'Comment too short';
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
		if(t.indexOf('Error') === 0) LBtitle.addClassName('LBTitleError');
		else LBtitle.removeClassName('LBTitleError');
		if(t.indexOf('Warning') === 0) LBtitle.addClassName('LBTitleWarn');
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
		$('theLightbox').removeClassName('widthAuto');
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
		adhoc.alternateKeys = false;
		adhoc.removeAutocomplete();
		$$('#theLightbox .nxj_lightboxContent').each(Element.remove);
		$$('#theLightbox .nxj_lightbox')[0].appendChild(cont);
		$('theLightbox').removeClassName('widthAuto');
		$('theLightbox').show();
	}
	// Prompt the user for a selection
	adhoc.promptSelect = function(prmpt, opts, callBack){
		// Add the prompt text as the title
		var LBtitle = $$('#theLightbox .nxj_lightboxTitle')[0];
		LBtitle.removeClassName('LBTitleError').removeClassName('LBTitleWarn').update(prmpt);

		// Create the new lightbox content
		var cont = $(document.createElement('div'));
		cont.addClassName('nxj_lightboxContent');

		// Create the selectBox holder
		var sel = $(document.createElement('div'));
		sel.addClassName('nxj_select').setAttribute('id', 'lb_select');
		sel.setAttribute('style', 'width:370px;');
		cont.appendChild(sel);

		// Create the selectbox display area
		var disp = $(document.createElement('div'));
		disp.addClassName('nxj_selectDisplay').addClassName('default');
		disp.update('- Select -');
		sel.appendChild(disp);

		// Create the selectbox arrow
		sel.appendChild($(document.createElement('div')).addClassName('nxj_selectArrow'));

		// Create the selectbox menu
		var menu = $(document.createElement('div'));
		sel.appendChild(menu.addClassName('nxj_selectInner'));

		// Create the hidden input for form submission
		var hid = $(document.createElement('input'));
		hid.addClassName('nxj_selectValue').setAttribute('id', 'lb_select_input');
		hid.setAttribute('type', 'hidden');
		sel.appendChild(hid);

		// Create and add the prompt options
		var hasDefault = false;
		for(var i=0; i<opts.length; ++i){
			// Create the option itself
			var opt = $(document.createElement('div')).addClassName('nxj_selectOption');
			opt.setAttribute('data-value', opts[i].value);
			if(opts[i].default){
				opt.setAttribute('data-default', 'true');
				hasDefault = true;
			}
			opt.update(opts[i].display);
			opt.observe('click', function(){
				disp.update(this.innerHTML);
				hid.value = this.getAttribute('data-value');
				$('lb_select_select').removeClassName('disabled');
			});
			menu.appendChild(opt);
		}

		// Activate the selectbox
		nxj.ui.selectBox.activateSelectBoxes(sel);

		// Add a break
		var br = $(document.createElement('br'));
		cont.appendChild(br);

		// Create the confirmation button
		var butt = $(document.createElement('a'));
		butt.setAttribute('id', 'lb_select_select');
		butt.addClassName('nxj_button');
		butt.addClassName('nxj_cssButton');
		if(!hasDefault) butt.addClassName('disabled');
		butt.update('Select');
		butt.observe('click', function(){
			if(butt.hasClassName('disabled')) return;
			$('theLightbox').hide();
			callBack($F(hid), disp.innerHTML);
		});
		cont.appendChild(butt);

		// Delete old lightbox content and add the new one, then show
		adhoc.removeAutocomplete();
		adhoc.alternateKeys = false;
		$$('#theLightbox .nxj_lightboxContent').each(Element.remove);
		$$('#theLightbox .nxj_lightbox')[0].appendChild(cont);
		$('theLightbox').removeClassName('widthAuto');
		$('theLightbox').show();
	}
	// Prompt the user for a value
	adhoc.promptValue = function(prmpt, dflt, vldt, algnR, callBack, searchFunc, sorryText, allowEmpty){
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
		inp.value = dflt;
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
			adhoc.attachAutocomplete(inp, rem, hid, acList, searchFunc, function(){}, vldt, sorryText, allowEmpty);
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
		adhoc.alternateKeys = false;
		adhoc.removeAutocomplete();
		$$('#theLightbox .nxj_lightboxContent').each(Element.remove);
		$$('#theLightbox .nxj_lightbox')[0].appendChild(cont);
		$('theLightbox').removeClassName('widthAuto');
		$('theLightbox').show();
		inp.focus();
	}
	// Pop up a dialog with info on a node
	adhoc.promptNode = function(n){
		// Function to check that info is ok before submitting
		function checkFields(){
			var change = false;
			var error = false;
			if($('lb_node_package')){
				if($('lb_node_package').hasClassName('red')) error = true;
				if($('lb_node_package').hasClassName('green')) change = true;
			}
			if($('lb_node_name')){
				if($('lb_node_name').hasClassName('red')) error = true;
				if($('lb_node_name').hasClassName('green')) change = true;
			}
			if($('lb_node_tags')){
				if($('lb_node_tags').hasClassName('red')) error = true;
				if($('lb_node_tags').hasClassName('green')) change = true;
			}
			if($('lb_node_comment')){
				if($('lb_node_comment').hasClassName('red')) error = true;
				if($('lb_node_comment').hasClassName('green')) change = true;
			}
			if($('lb_select_input')){
				if($('lb_select_input').hasClassName('changed')) change = true;
			}
			if($('lb_select2_input')){
				if($('lb_select2_input').hasClassName('changed')) change = true;
			}
			if(change && !error) $('lb_input_select').removeClassName('disabled');
			else $('lb_input_select').addClassName('disabled');
		}

		// Add a title
		var LBtitle = $$('#theLightbox .nxj_lightboxTitle')[0];
		LBtitle.removeClassName('LBTitleError').removeClassName('LBTitleWarn').update("Node "+n.id);

		// Create the new lightbox content
		var cont = $(document.createElement('div'));
		cont.addClassName('nxj_lightboxContent');

		// Create a table for all the node attributes
		var table = $(document.createElement('table')), row, cellR, cellL;

		// Create the node's type field
		row = $(document.createElement('tr'));
		cellR = $(document.createElement('td'));
		cellL = $(document.createElement('td'));
		cellL.addClassName('attrName').update('Type');
		cellR.update(
			adhoc.nodeTypeNames[n.nodeType]
			+ '&nbsp;&nbsp;-&nbsp;&nbsp;'
			+ adhoc.nodeWhichNames[adhoc.nodeWhichIndices[n.which][0]][adhoc.nodeWhichIndices[n.which][1]][0]
		);
		row.appendChild(cellL);
		row.appendChild(cellR);
		table.appendChild(row);

		// Create the node's package field
		row = $(document.createElement('tr'));
		cellR = $(document.createElement('td'));
		cellL = $(document.createElement('td'));
		cellL.addClassName('attrName').update('Package');
		cellR.setAttribute('id', 'lb_node_package');
		cellR.update(n.package);
		row.appendChild(cellL);
		row.appendChild(cellR);
		table.appendChild(row);

		// Create the node's name field if appropriate based on its which
		if(n.nodeType==adhoc.nodeTypes.ACTION || n.nodeType==adhoc.nodeTypes.VARIABLE){
			row = $(document.createElement('tr'));
			cellR = $(document.createElement('td'));
			cellL = $(document.createElement('td'));
			cellL.addClassName('attrName').update('Name');
			switch(n.which){
			case adhoc.nodeWhich.ACTION_DEFIN:
				var inp = $(document.createElement('input'));
				inp.addClassName('nxj_input').setAttribute('type', 'text');
				inp.setAttribute('id', 'lb_node_name');
				inp.setAttribute('value', n.name);
				var rem = $(document.createElement('div'));
				rem.setAttribute('id', 'lb_input_error');
				inp.observe('keyup', function(e){
					// Ignore certain keys
					var key = e.which || window.event.keyCode;
					if(key==9 || key==16 || (key>=35 && key<=40)) return;

					// On keyup, validate the input
					var msg = adhoc.validateActionDefName($F(this));
					if(msg){
						// Input is invalid, display a message
						this.removeClassName('green').addClassName('red');
						rem.update(msg);
					}else{
						// Input is good, allow submission
						this.removeClassName('red').addClassName('green');
						rem.update('');
					}
					if($F(this) == n.name){
						this.removeClassName('red').removeClassName('green');
						$('lb_input_error').update('');
					}
					checkFields();
				});
				cellR.appendChild(inp);
				cellR.appendChild(rem);
				break;
			case adhoc.nodeWhich.ACTION_CALL:
				var acBox = $(document.createElement('div'));
				acBox.addClassName('searchHolder');
				var inp = $(document.createElement('input'));
				inp.addClassName('nxj_input').setAttribute('type', 'text');
				inp.setAttribute('id', 'lb_node_name');
				inp.setAttribute('value', n.name);
				var rem = $(document.createElement('input'));
				rem.setAttribute('type', 'hidden');
				rem.setAttribute('value', n.package);
				var hid = $(document.createElement('input'));
				hid.setAttribute('type', 'hidden');
				hid.setAttribute('value', n.name);
				var acList = $(document.createElement('div'));
				acList.setAttribute('id', 'lb_input_acList');
				acList.setAttribute('style', 'display:none;');
				acBox.appendChild(inp);
				acBox.appendChild(hid);
				acBox.appendChild(acList);
				cellR.appendChild(acBox);
				adhoc.attachAutocomplete(inp, rem, hid, acList, (n==adhoc.rootNode ? null : adhoc.actionSearch), function(val, rem, hid){
					if(val){
						inp.removeClassName('red').addClassName('green');
						$('lb_node_package').update(rem || adhoc.setting('projectName'));
					}else{
						inp.removeClassName('green').addClassName('red');
						$('lb_node_package').update(adhoc.setting('projectName'));
					}
					if($F(inp) == n.name){
						inp.removeClassName('red').removeClassName('green');
						$('lb_input_error').update('');
					}
					checkFields();
				}, adhoc.validateActionName, 'No Action Found');
				break;
			case adhoc.nodeWhich.VARIABLE_ASIGN:
			case adhoc.nodeWhich.VARIABLE_EVAL:
				var acBox = $(document.createElement('div'));
				acBox.addClassName('searchHolder');
				var inp = $(document.createElement('input'));
				inp.addClassName('nxj_input').setAttribute('type', 'text');
				inp.setAttribute('id', 'lb_node_name');
				inp.setAttribute('value', n.name);
				var hid = $(document.createElement('input'));
				hid.setAttribute('type', 'hidden');
				inp.setAttribute('id', 'lb_node_ref');
				hid.setAttribute('value', n.name);
				var acList = $(document.createElement('div'));
				acList.setAttribute('id', 'lb_input_acList');
				acList.setAttribute('style', 'display:none;');
				acBox.appendChild(inp);
				acBox.appendChild(hid);
				acBox.appendChild(acList);
				cellR.appendChild(acBox);
				adhoc.attachAutocomplete(inp, n.name, hid, acList, (n==adhoc.rootNode ? null : adhoc.genScopeSearch(n.parent)), function(val, rem, hid){
					if(val) inp.removeClassName('red').addClassName('green');
					else inp.removeClassName('green').addClassName('red');
					if($F(inp) == n.name){
						inp.removeClassName('red').removeClassName('green');
						$('lb_input_error').update('');
					}
					checkFields();
				}, adhoc.validateIdentifier, 'New Variable');
				break;
			}
			row.appendChild(cellL);
			row.appendChild(cellR);
			table.appendChild(row);
		}

		// Create the node's tags field
		row = $(document.createElement('tr'));
		cellR = $(document.createElement('td'));
		cellL = $(document.createElement('td'));
		cellL.addClassName('attrName').update('Tags');
		var tagsInput = $(document.createElement('input'));
		tagsInput.addClassName('nxj_input').setAttribute('id', 'lb_node_tags');
		tagsInput.value = adhoc.getTagsByNode(n).join(', ');
		var tagsError = $(document.createElement('div'));
		tagsError.setAttribute('id', 'lb_tags_error');
		tagsInput.observe('keyup', function(e){
			// Ignore certain keys
			var key = e.which || window.event.keyCode;
			if(key==9 || key==16 || (key>=35 && key<=40)) return;

			// On keyup, validate the input
			var msg = adhoc.validateTagsString($F(this));
			if(msg){
				// Input is invalid, display a message
				this.removeClassName('green').addClassName('red');
				tagsError.update(msg);
			}else{
				// Input is good, allow submission
				this.removeClassName('red').addClassName('green');
				tagsError.update('');
			}
			checkFields();
		});
		cellR.appendChild(tagsInput);
		cellR.appendChild(tagsError);
		row.appendChild(cellL);
		row.appendChild(cellR);
		table.appendChild(row);

		// Create a dataType field when appropriate
		if(n.nodeType == adhoc.nodeTypes.ACTION
				|| n.nodeType == adhoc.nodeTypes.OPERATOR
				|| n.nodeType == adhoc.nodeTypes.ASSIGNMENT
				|| n.nodeType == adhoc.nodeTypes.VARIABLE
				|| n.nodeType == adhoc.nodeTypes.LITERAL
			){
			row = $(document.createElement('tr'));
			cellR = $(document.createElement('td'));
			cellL = $(document.createElement('td'));
			cellL.addClassName('attrName').update('DataType');

			// If editable, create a selectBox holder
			if(n.nodeType==adhoc.nodeTypes.ACTION || n.nodeType==adhoc.nodeTypes.VARIABLE){
				var sel = $(document.createElement('div'));
				sel.addClassName('nxj_select').setAttribute('id', 'lb_select');
				sel.setAttribute('style', 'width:370px;');
				cellR.appendChild(sel);

				// Create the selectbox display area
				var disp = $(document.createElement('div'));
				disp.addClassName('nxj_selectDisplay').addClassName('default');
				disp.update('- Select -');
				sel.appendChild(disp);

				// Create the selectbox arrow
				sel.appendChild($(document.createElement('div')).addClassName('nxj_selectArrow'));

				// Create the selectbox menu
				var menu = $(document.createElement('div'));
				sel.appendChild(menu.addClassName('nxj_selectInner'));

				// Create the hidden input for form submission
				var hid = $(document.createElement('input'));
				hid.addClassName('nxj_selectValue').setAttribute('id', 'lb_select_input');
				hid.setAttribute('type', 'hidden');
				sel.appendChild(hid);

				var opts = [
					{
						value: adhoc.nodeDataTypes.BOOL
						,display: 'Bool'
					},{
						value: adhoc.nodeDataTypes.INT
						,display: 'Int'
					},{
						value: adhoc.nodeDataTypes.FLOAT
						,display: 'Float'
					},{
						value: adhoc.nodeDataTypes.STRING
						,display: 'String'
					},{
						value: adhoc.nodeDataTypes.ARRAY
						,display: 'Array'
					},{
						value: adhoc.nodeDataTypes.HASH
						,display: 'Hash'
					},{
						value: adhoc.nodeDataTypes.STRUCT
						,display: 'Struct'
					},{
						value: adhoc.nodeDataTypes.ACTION
						,display: 'Action'
					},{
						value: adhoc.nodeDataTypes.MIXED
						,display: 'Mixed - <i>(some languages only)</i>'
					}
				];
				if(n.nodeType == adhoc.nodeTypes.ACTION){
					opts.unshift({
						value: adhoc.nodeDataTypes.VOID
						,display: 'Void'
					});
				}
				for(var i=0; i<opts.length; ++i){
					// Create the option itself
					var opt = $(document.createElement('div')).addClassName('nxj_selectOption');
					opt.setAttribute('data-value', opts[i].value);
					if(opts[i].value == n.dataType){
						opt.setAttribute('data-default', 'true');
					}
					opt.update(opts[i].display);
					opt.observe('click', function(){
						disp.update(this.innerHTML);
						hid.value = this.getAttribute('data-value');
						$('lb_input_select').removeClassName('disabled');
						$('lb_select_input').addClassName('changed');
					});
					menu.appendChild(opt);
				}

				// Add the selectbox to the table, then activate it
				cellR.appendChild(sel);
				row.appendChild(cellL);
				row.appendChild(cellR);
				table.appendChild(row);
				nxj.ui.selectBox.activateSelectBoxes(sel);
			}else{
				cellR.update(adhoc.nodeDataTypeNames[n.dataType]);
				row.appendChild(cellL);
				row.appendChild(cellR);
				table.appendChild(row);
			}
		}

		// Create a child dataType field when appropriate
		if((n.dataType == adhoc.nodeDataTypes.ARRAY
				|| n.dataType == adhoc.nodeDataTypes.HASH)
				&& n.childType != adhoc.nodeChildType.PARAMETER
				&& n.childType != adhoc.nodeChildType.INITIALIZATION
			){
			row = $(document.createElement('tr'));
			cellR = $(document.createElement('td'));
			cellL = $(document.createElement('td'));
			cellL.addClassName('attrName').update('Child DataType');

			// Create the selectBox holder
			var sel2 = $(document.createElement('div'));
			sel2.addClassName('nxj_select').setAttribute('id', 'lb_select2');
			sel2.setAttribute('style', 'width:370px;');
			cellR.appendChild(sel2);

			// Create the selectbox display area
			var disp2 = $(document.createElement('div'));
			disp2.addClassName('nxj_selectDisplay').addClassName('default');
			disp2.update('- Select -');
			sel2.appendChild(disp2);

			// Create the selectbox arrow
			sel2.appendChild($(document.createElement('div')).addClassName('nxj_selectArrow'));

			// Create the selectbox menu
			var menu2 = $(document.createElement('div'));
			sel2.appendChild(menu2.addClassName('nxj_selectInner'));

			// Create the hidden input for form submission
			var hid2 = $(document.createElement('input'));
			hid2.addClassName('nxj_selectValue').setAttribute('id', 'lb_select2_input');
			hid2.setAttribute('type', 'hidden');
			sel2.appendChild(hid2);

			// Create and add the prompt options
			var opts2 = [
				{
					value: adhoc.nodeDataTypes.BOOL
					,display: 'Bool'
				},{
					value: adhoc.nodeDataTypes.INT
					,display: 'Int'
				},{
					value: adhoc.nodeDataTypes.FLOAT
					,display: 'Float'
				},{
					value: adhoc.nodeDataTypes.STRING
					,display: 'String'
				},{
					value: adhoc.nodeDataTypes.ARRAY
					,display: 'Array'
				},{
					value: adhoc.nodeDataTypes.HASH
					,display: 'Hash'
				},{
					value: adhoc.nodeDataTypes.STRUCT
					,display: 'Struct'
				},{
					value: adhoc.nodeDataTypes.ACTION
					,display: 'Action'
				},{
					value: adhoc.nodeDataTypes.MIXED
					,display: 'Mixed - <i>(some languages only)</i>'
				}
			];
			for(var i=0; i<opts2.length; ++i){
				// Create the option itself
				var opt2 = $(document.createElement('div')).addClassName('nxj_selectOption');
				opt2.setAttribute('data-value', opts2[i].value);
				opt2.update(opts2[i].display);
				if(opts2[i].value == n.childDataType){
					opt2.setAttribute('data-default', 'true');
				}
				// Disable ones that fail to cast some children
				for(var j=0; j<n.children.length; ++j){
					if(!n.children[j].children[0].dataType) continue;
					if(adhoc.resolveTypes(opts2[i].value,n.children[j].children[0].dataType) != opts2[i].value){
						opts2[i].disabled = true;
					}
				}
				// Handle selection
				opt2.observe('click', function(){
					var newDataType2 = parseInt(this.getAttribute('data-value'));
					if(newDataType2 != adhoc.nodeDataTypes.MIXED){
						for(var j=0; j<n.children.length; ++j){
							if(!n.children[j].children[0].dataType) continue;
							if(adhoc.resolveTypes(newDataType2,n.children[j].children[0].dataType) != newDataType2){
								return alert('Some children do not match this datatype and cannot be cast');
							}
						}
					}
					disp2.update(this.innerHTML);
					hid2.value = this.getAttribute('data-value');
					$('lb_input_select').removeClassName('disabled');
					$('lb_select2_input').addClassName('changed');
				});
				menu2.appendChild(opt2);
			}

			// Add the selectbox to the table, then activate it
			cellR.appendChild(sel2);
			row.appendChild(cellL);
			row.appendChild(cellR);
			table.appendChild(row);
			nxj.ui.selectBox.activateSelectBoxes(sel2);
		}

		// Create a comment field when appropriate
		if(n.childType == adhoc.nodeChildType.STATEMENT){
			row = $(document.createElement('tr'));
			cellR = $(document.createElement('td'));
			cellL = $(document.createElement('td'));
			cellL.addClassName('attrName').update('Comment');
			var inpC = $(document.createElement('textarea'));
			inpC.setAttribute('id', 'lb_node_comment');
			inpC.addClassName('nxj_input').setAttribute('style', 'height:60px;');
			inpC.update(n.value);
			var remC = $(document.createElement('div'));
			remC.setAttribute('id', 'lb_comment_error');
			inpC.observe('keyup', function(e){
				// Ignore certain keys
				var key = e.which || window.event.keyCode;
				if(key==9 || key==16 || (key>=35 && key<=40)) return;

				// On keyup, validate the input
				var msg = adhoc.validateComment($F(this));
				if(msg){
					// Input is invalid, display a message
					this.removeClassName('green').addClassName('red');
					remC.update(msg);
				}else{
					// Input is good, allow submission
					this.removeClassName('red').addClassName('green');
					remC.update('');
				}
				if($F(this) == n.value){
					this.removeClassName('red').removeClassName('green');
					$('lb_comment_error').update('');
				}
				checkFields();
			});
			cellR.appendChild(inpC);
			cellR.appendChild(remC);
			row.appendChild(cellL);
			row.appendChild(cellR);
			table.appendChild(row);
		}

		// Add the table
		cont.appendChild(table);

		// Add the submit button
		var butt = $(document.createElement('a'));
		butt.setAttribute('id', 'lb_input_select');
		butt.addClassName('nxj_button').addClassName('nxj_cssButton').addClassName('disabled').update('Update');
		butt.observe('click', function(){
			checkFields();
			if(this.hasClassName('disabled')) return;
			if($('lb_node_name') && $('lb_node_name').hasClassName('green')) adhoc.renameNode(
				n
				,($('lb_node_package') ? $('lb_node_package').innerHTML : n.package)
				,($('lb_node_name') ? $F('lb_node_name') : n.name)
				,($('lb_node_ref') ? parseInt($F('lb_node_ref')) : n.referenceId)
				,true
			);
			if($('lb_node_tags')) adhoc.changeTags(
				n
				,$F('lb_node_tags')
			);
			if($('lb_select_input') && n.dataType != parseInt($F('lb_select_input'))) adhoc.changeDatatype(
				n
				,parseInt($F('lb_select_input'))
			);
			if($('lb_select2_input') && n.childDataType != parseInt($F('lb_select2_input'))) adhoc.changeChildDataType(
				n
				,parseInt($F('lb_select2_input'))
			);
			if($('lb_node_comment') && $('lb_node_comment').hasClassName('green')) adhoc.changeComment(
				n
				,$F('lb_node_comment')
			);
			$('theLightbox').hide();
			adhoc.refreshRender();
		});
		cont.appendChild(butt);

		// Delete old lightbox content and add the new one, then show
		adhoc.alternateKeys = false;
		adhoc.removeAutocomplete();
		$$('#theLightbox .nxj_lightboxContent').each(Element.remove);
		$$('#theLightbox .nxj_lightbox')[0].appendChild(cont);
		$('theLightbox').addClassName('widthAuto');
		$('theLightbox').show();
		return false;
	}
	// Popup a map of all action definition nodes
	adhoc.promptActionList = function(){
		prmpt = 'Jump to Action'
		dflt = '';
		vldt = adhoc.validateActionNameOrEmpty;
		algnR = false;
		callBack = function(val, rem, hid){
			if(!isNaN(parseInt(hid)) && isFinite(hid) && parseInt(hid)){
				$('theLightbox').hide();
				var n = adhoc.allNodes[parseInt(hid)];
				if(adhoc.selectedNode) adhoc.selectedNode.selected = false;
				n.selected = true;
				adhoc.selectedNode = n;
				adhoc.snapToNode(n);
			}
		}
		searchFunc = function(part){
			// Create an empty list of actions to return
			var out = [];

			// Create recursive search function, and call it
			var searchActionList = function(namePart, n, l, i){
				if(n.nodeType == adhoc.nodeTypes.ACTION && (
						!namePart
						|| n.name.match(new RegExp('^'+namePart, 'i'))
					)){
					newItemNameHTML = "<span>&nbsp;</span><span class=\"actionListSpacer\" style=\"width:"+(i*20)+"px;\"></span><span class=\"actionListItem "+(n.which==adhoc.nodeWhich.ACTION_DEFIN?'actionDefin':'actionCall')+"\">"+n.name+"</span>";
					l.push({
						value: n.name
						,reminder: n.id + (n.value ? " - "+n.value : '')
						,hidden: n.id
						,code: newItemNameHTML
					});
					++i;
				}
				for(var j=0; j<n.children.length; ++j)
					searchActionList(namePart, n.children[j], l, i);
			}
			searchActionList(part, adhoc.rootNode, out, 0);

			// Return the final list
			return out;
		}
		sorryText = 'No actions used with that name';
		allowEmpty = true;
		adhoc.promptValue(prmpt, dflt, vldt, algnR, callBack, searchFunc, sorryText, allowEmpty);
		$('theLightbox').addClassName('widthAuto');
	}
	// Show the similarity analysis for a node
	adhoc.promptAnalysis = function(n){
		// Add a title
		var LBtitle = $$('#theLightbox .nxj_lightboxTitle')[0];
		LBtitle.removeClassName('LBTitleError').removeClassName('LBTitleWarn').update('Analysis for node '+n.id);

		// Create the new lightbox content
		var cont = $(document.createElement('div'));
		cont.addClassName('nxj_lightboxContent');

		// Get analysis information
		analysis = adhoc.analyzeNode(n);

		// Compute various metrics
		var output = "";
		output += 'Total Loops: '		+ analysis.totalLoops + '<br/>';
		output += 'Max Loop Nest: '		+ analysis.maxLoopNest + '<br/>';
		output += 'Cond. Returns: '		+ analysis.conditionalReturns + '<br/>';
		output += 'Action Verb: '		+ "'"+analysis.actionVerb+"'" + '<br/>';
		output += 'Node Count: '		+ analysis.nodeCount + '<br/>';
		output += 'Child Count: '		+ analysis.childCount + '<br/>';
		output += 'Input Types: '		+ analysis.inputTypes.join(', ') + '<br/>';
		output += 'Output Type: '		+ analysis.outputType + '<br/>';
		output += 'Actions Called: '	+ analysis.actionsCalled + '<br/>';
		output += 'Tags: '				+ (analysis.tags.length ? analysis.tags.join(', ') : '<i>none</i>') + '<br/>';
		cont.update(output);

		// If this is an action definition, we can compare it against known actions
		if(n.which == adhoc.nodeWhich.ACTION_DEFIN){
			// Create a holder for the analysis results to return to
			var landingZone = $(document.createElement('div')).addClassName('loading');
			landingZone.setAttribute('id', 'analysisLanding');
			cont.appendChild(landingZone);

			// Send AJAX request for analysis results
			new Ajax.Request('analyze/', {
				parameters: {
					name			: n.name
					,package		: n.package
					,totalLoops		: analysis.totalLoops
					,maxLoopNest	: analysis.maxLoopNest
					,condReturns	: analysis.conditionalReturns
					,actionVerb		: analysis.actionVerb
					,nodeCount		: analysis.nodeCount
					,childCount		: analysis.childCount
					,inputsVoid		: analysis.inputTypes[0]
					,inputsBool		: analysis.inputTypes[1]
					,inputsInt		: analysis.inputTypes[2]
					,inputsFloat	: analysis.inputTypes[3]
					,inputsString	: analysis.inputTypes[4]
					,inputsArray	: analysis.inputTypes[5]
					,inputsHash		: analysis.inputTypes[6]
					,inputsStruct	: analysis.inputTypes[7]
					,inputsAction	: analysis.inputTypes[8]
					,inputsMixed	: analysis.inputTypes[9]
					,outputType		: analysis.outputType
					,userTags		: (analysis.tags.length ? analysis.tags.join(',') : '')
					,xsrftoken		: $('xsrfToken').innerHTML
				}
				,onSuccess: function(t){
					if(!$('analysisLanding')) return;
					$('analysisLanding').removeClassName('loading').update(t.responseText);
				}
				,onFailure: function(t){
					adhoc.message('Warning: Analysis Failed', t.responseText);
				}
			});
		}

		// Delete old lightbox content and add the new one, then show
		adhoc.alternateKeys = false;
		adhoc.removeAutocomplete();
		$$('#theLightbox .nxj_lightboxContent').each(Element.remove);
		$$('#theLightbox .nxj_lightbox')[0].appendChild(cont);
		$('theLightbox').addClassName('widthAuto');
		$('theLightbox').show();
		return false;
	}
	// Pop up a dialog containing an IFramed page
	adhoc.promptIFrame = function(prmpt, url){
		// Add the prompt text as the title
		var LBtitle = $$('#theLightbox .nxj_lightboxTitle')[0];
		LBtitle.removeClassName('LBTitleError').removeClassName('LBTitleWarn').update(prmpt);

		// Create the new lightbox content
		var cont = $(document.createElement('div'));
		cont.addClassName('nxj_lightboxContent');

		// Create the IFrame
		var frame = $(document.createElement('iframe'));
		frame.setAttribute('src', url);
		var height = document.viewport.getDimensions().height;
		frame.setAttribute('style', 'height:'+(height-170)+'px;');
		cont.appendChild(frame);
		frame.observe('load', function(){ this.contentWindow.focus(); });

		// Delete old lightbox content and add the new one, then show
		adhoc.alternateKeys = false;
		adhoc.removeAutocomplete();
		$$('#theLightbox .nxj_lightboxContent').each(Element.remove);
		$$('#theLightbox .nxj_lightbox')[0].appendChild(cont);
		$('theLightbox').addClassName('widthAuto');
		$('theLightbox').show();
	}
	// Remove any iframes, close the lightbox, and eturn focus to the canvas
	adhoc.regainFocus = function(){
		$$('#theLightbox .nxj_lightboxContent').each(Element.remove);
		$('theLightbox').hide();
		window.focus();
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
	adhoc.attachAutocomplete = function(input, reminder, hidden, list, acSearchFunc, acLoadFunc, validate, acSorryText, allowEmpty){
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
			if((!term&&!allowEmpty) || validate(term)) return acClose();

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
			if(!term && !allowEmpty){
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
					elem.setAttribute('data-code', item.code ? '1' : '0');
					elem.update(
						(item.code
							? item.code
							: item.value.replace(acRxp, '<span class="match">$1</span>')
						)
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

		// Attach the listener to the autocomplete input
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
				case 'tags':
				case 'datatype':
				case 'childdatatype':
				case 'revalue':
				case 'comment':
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
				if(adhoc.setting('username')){
					$('savePackageButton').removeClassName('disabled');
					$('savePackageButton').update('Save');
				}

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
				// Undo a tags change
				case 'tags':
				// Undo a revalue
				case 'revalue':
				// Undo a datatype change
				case 'datatype':
				// Undo a childdatatype change
				case 'childdatatype':
				// Undo a comment change
				case 'comment':
				// Undo a deletion
				case 'delete':
				// Undo a general action
				default:
					adhoc.restoreNode(adhoc.allNodes[item.parentId], item.serial);
					adhoc.refreshRender();
				}

				// Activate the 'save' button if user is logged in
				if(adhoc.setting('username')){
					$('savePackageButton').removeClassName('disabled');
					$('savePackageButton').update('Save');
				}

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

				// Redo a tags change
				case 'tags':
					var newTags = [];
					var tags = item.target.split(',');
					for(var i=0; i<tags.length; ++i){
						newTags.push(tags[i].trim("\\s"));
					}
					adhoc.allTags[item.parentId] = newTags;
					adhoc.refreshRender();
					break;

				// Redo a datatype change
				case 'datatype':
					adhoc.allNodes[item.parentId].dataType = item.target;
					adhoc.refreshRender();
					break;

				// Redo a childdatatype change
				case 'childdatatype':
					adhoc.allNodes[item.parentId].childDataType = item.target;
					adhoc.refreshRender();
					break;

				// Redo a revalue or a comment change
				case 'revalue':
				case 'comment':
					adhoc.allNodes[item.parentId].value = item.target;
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
				if(adhoc.setting('username')){
					$('savePackageButton').removeClassName('disabled');
					$('savePackageButton').update('Save');
				}

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
		$('histBack').addClassName('disabled');
		$('histFwd').addClassName('disabled');
	}

	// Initialize the GUI editor
	adhoc.init = function(){
		// Load settings from cookie but reset the project ID
		if(document.cookie && document.cookie.indexOf('adhocSettings=')>=0){
			var settingsJSON = document.cookie.match(/adhocSettings=([^;]*)/);
			var loadedSettings = decodeURIComponent(settingsJSON[1]).evalJSON();
			for(var i in loadedSettings){
				if(i=='projectName' || i=='projectId') continue;
				adhoc.setting(i, loadedSettings[i]);
			}
		}else{
			document.cookie = 'adhocSettings='+encodeURIComponent(Object.toJSON(adhoc.settings))+';path=/adhoc_demo/';
		}

		// Activate new package button
		$('newPackageButton').observe('click', adhoc.newProject);

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
			adhoc.promptValue('Rename This Package', adhoc.setting('projectName'), adhoc.validatePackageName, false, function(val){
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
			if(!$(this).hasClassName('disabled')) adhoc.saveProject();
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

		// Activate the help link
		$('helpLink').observe('click', adhoc.help);

		// Activate the generate executable checkbox
		$('generateExecutable').observe('change', function(){
			adhoc.setting('executable', this.checked);
		});

		// Activate the generate button
		$('generateButton').observe('click', adhoc.generateCode);

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
				if(adhoc.selectedNode) adhoc.selectedNode.selected = false;
				adhoc.selectedNode = prnt;
				prnt.selected = true;

				// For variables, determine the which from context
				if(type == adhoc.nodeTypes.VARIABLE){
					var neededChildren = adhoc.nodeWhichChildren[prnt.nodeType][adhoc.nodeWhichIndices[prnt.which][1]];
					if(prnt.childType == adhoc.nodeChildType.INDEX) neededChildren = adhoc.nodeWhichChildren[0][1];
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
						adhoc.promptValue('Enter an action name:', '', adhoc.validateActionDefName, false, function(val){
							adhoc.deactivateAllTools();
							var n = adhoc.createNode(null, prnt, repl, type, which, childType, null, val);
							if(n) setTimeout(function(){
								adhoc.promptValue('Add a comment:', '', adhoc.validateComment, false, function(val){
									n.value = val ? val : null;
								});
							}, 10);
						});
						break;

					case adhoc.nodeWhich.ACTION_CALL:
						// Prompt for an action name
						adhoc.promptValue('Enter an action name:', '', adhoc.validateActionName, false, function(val, rem, hid){
							adhoc.deactivateAllTools();
							adhoc.createNode(null, prnt, repl, type, which, childType, rem, val, null, hid);
						}, adhoc.actionSearch, 'Not found in loaded projects');
						break;

					case adhoc.nodeWhich.VARIABLE_ASIGN:
					case adhoc.nodeWhich.VARIABLE_EVAL:
						// Prompt for a variable name
						adhoc.promptValue('Enter a variable name:', '', adhoc.validateIdentifier, false, function(val, rem, hid){
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
						adhoc.promptValue('Enter an integer:', '', adhoc.validateInt, true, function(val){
							adhoc.deactivateAllTools();
							adhoc.createNode(null, prnt, repl, type, which, childType, null, null, parseInt(val));
						});
						break;

					case adhoc.nodeWhich.LITERAL_FLOAT:
						// Prompt for a float value
						adhoc.promptValue('Enter a float:', '', adhoc.validateFloat, true, function(val){
							adhoc.deactivateAllTools();
							adhoc.createNode(null, prnt, repl, type, which, childType, null, null, parseFloat(val));
						});
						break;

					case adhoc.nodeWhich.LITERAL_STRNG:
						// Prompt for a string value
						adhoc.promptValue('Enter a string:', '', adhoc.validateString, false, function(val){
							adhoc.deactivateAllTools();
							adhoc.createNode(null, prnt, repl, type, which, childType, null, null, val);
						});
						break;

					case adhoc.nodeWhich.LITERAL_ARRAY:
					case adhoc.nodeWhich.LITERAL_HASH:
						// Create the array/hash first
						adhoc.deactivateAllTools();
						var newArray = adhoc.createNode(null, prnt, repl, type, which, childType);
						// Then prompt for a child data type
						adhoc.promptSelect('Choose dataType held:', [
							{
								value: adhoc.nodeDataTypes.BOOL
								,display: 'Bool'
							},{
								value: adhoc.nodeDataTypes.INT
								,display: 'Int'
							},{
								value: adhoc.nodeDataTypes.FLOAT
								,display: 'Float'
							},{
								value: adhoc.nodeDataTypes.STRING
								,display: 'String'
							},{
								value: adhoc.nodeDataTypes.ARRAY
								,display: 'Array'
							},{
								value: adhoc.nodeDataTypes.HASH
								,display: 'Hash'
							},{
								value: adhoc.nodeDataTypes.STRUCT
								,display: 'Struct'
							},{
								value: adhoc.nodeDataTypes.ACTION
								,display: 'Action'
							},{
								value: adhoc.nodeDataTypes.MIXED
								,display: 'Mixed - <i>(some languages only)</i>'
								,default: 1
							}
						], function(val, disp){
							if(val != adhoc.nodeDataTypes.VOID)
								newArray.childDataType = val;
						});
						break;

					case adhoc.nodeWhich.LITERAL_STRCT:
						adhoc.deactivateAllTools();
						adhoc.message('Warning', 'This type of literal is not yet implemented'); break;
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
				if(prnt.childType == adhoc.nodeChildType.INDEX) neededChildren = adhoc.nodeWhichChildren[0][1];
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
				// If the clicked node was already selected, pop up an info window
				if(clickedNode==adhoc.selectedNode){
					adhoc.foldNode(adhoc.selectedNode);

				// If not, select it
				}else{
					if(adhoc.selectedNode) adhoc.selectedNode.selected = false;
					clickedNode.selected = true;
					adhoc.selectedNode = clickedNode;
				}

			// Empty space was clicked, deselect the selected node
			}else if(adhoc.selectedNode){
				if($('lb_input_acList')) $('lb_input_acList').hide();
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
			// (CTRL/CMD/etc.) set alternamte key mode on
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
				// Submit the project laod dialog
				if($('projectLightbox').visible()){
					// Load the hovered project
					$$('#projectSelect .nxj_selectOption.hovered').each(function(hoveredProject){
						hoveredProject.click();
					});

				// Submit prompt flag
				}else if($('theLightbox').visible()){
					var checkedRadio = false;
					$$('#theLightbox input[name=lb_flag_opt]').each(function(radio){
						if(radio.checked) checkedRadio = true;
					});
					if(checkedRadio){
						$('lb_flag_select').click();
						break;
					}

				// Open info popup for selected node
				}else if(adhoc.selectedNode){
					adhoc.promptNode(adhoc.selectedNode);
				}
				break;

			// (Space) rename certain nodes, if selected
			case Event.KEY_SPACE:
				if(!adhoc.selectedNode) break;
				if($('theLightbox').visible()) break;
				if($('projectLightbox').visible()) break;
				if($('output').visible()) break;
				switch(adhoc.selectedNode.which){
				// Rename a defined action
				case adhoc.nodeWhich.ACTION_DEFIN:
					Event.stop(e);
					adhoc.promptValue('Rename this action:', adhoc.selectedNode.name, adhoc.validateActionDefName, false, function(val, rem, hid){
						adhoc.history.record('rename', (hid?parseInt(hid):val), adhoc.selectedNode);
						adhoc.renameNode(adhoc.selectedNode, rem, val, hid);
						adhoc.refreshRender();
					});
					break;

				//Change an action call
				case adhoc.nodeWhich.ACTION_CALL:
					Event.stop(e);
					adhoc.promptValue('Call a different action:', adhoc.selectedNode.name, adhoc.validateActionName, false, function(val, rem, hid){
						adhoc.history.record('rename', (hid?parseInt(hid):val), adhoc.selectedNode);
						adhoc.renameNode(adhoc.selectedNode, rem, val, hid);
						adhoc.refreshRender();
					}, adhoc.actionSearch, 'Not found in loaded projects');
					break;

				// Rename a variable
				case adhoc.nodeWhich.VARIABLE_ASIGN:
				case adhoc.nodeWhich.VARIABLE_EVAL:
					Event.stop(e);
					adhoc.promptValue('Enter a variable name:', adhoc.selectedNode.name, adhoc.validateIdentifier, false, function(val, rem, hid){
						var nodeToRename = adhoc.selectedNode.referenceId ? adhoc.allNodes[adhoc.selectedNode.referenceId] : adhoc.selectedNode;
						adhoc.history.record('rename', (hid?parseInt(hid):val), nodeToRename);
						adhoc.renameNode(nodeToRename, rem, val, hid);
						adhoc.refreshRender();
					}, adhoc.genScopeSearch(adhoc.selectedNode.parent, false), 'New variable');
					break;

				case adhoc.nodeWhich.LITERAL_BOOL:
					Event.stop(e);
					adhoc.promptFlag('Select a boolean value:', ['true', 'false'], function(val){
						adhoc.history.record('revalue', !val, adhoc.selectedNode);
						adhoc.selectedNode.value = !val;
						adhoc.refreshRender();
					});
					break;

				case adhoc.nodeWhich.LITERAL_INT:
					Event.stop(e);
					adhoc.promptValue('Enter an integer:', adhoc.selectedNode.value, adhoc.validateInt, true, function(val){
						adhoc.history.record('revalue', val, adhoc.selectedNode);
						adhoc.selectedNode.value = val;
						adhoc.refreshRender();
					});
					break;

				case adhoc.nodeWhich.LITERAL_FLOAT:
					Event.stop(e);
					adhoc.promptValue('Enter a float:', adhoc.selectedNode.value, adhoc.validateFloat, true, function(val){
						adhoc.history.record('revalue', val, adhoc.selectedNode);
						adhoc.selectedNode.value = val;
						adhoc.refreshRender();
					});
					break;

				case adhoc.nodeWhich.LITERAL_STRNG:
					Event.stop(e);
					adhoc.promptValue('Enter a string:', adhoc.selectedNode.value, adhoc.validateString, false, function(val){
						adhoc.history.record('revalue', val, adhoc.selectedNode);
						adhoc.selectedNode.value = val;
						adhoc.refreshRender();
					});
					break;

				default:
				}
				break;

			// (DEL) Remove the selected node and it's children
			case Event.KEY_DELETE:
				// Edge cases
				if(!adhoc.selectedNode) break;
				if($('theLightbox').visible()) break;
				if($('projectLightbox').visible()) break;
				if($('output').visible()) break;
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
				}else{
					var selector = $('toolbox').className == 'Operator'
						? '#toolboxItems .Operator, #toolboxItems .Assignment'
						: '#toolboxItems .'+$('toolbox').className;
					var tools = $$(selector);
					for(var index = 0; index<tools.length; ++index){
						if(!tools[index].hasClassName('active')) continue;
						switch(key){
						case Event.KEY_DOWN:
						case Event.KEY_RIGHT:
							if(index == tools.length-1) break;
							tools[index].removeClassName('active');
							tools[++index].addClassName('active');
							Effect.ScrollTo(tools[index]);
							break;
						case Event.KEY_UP:
						case Event.KEY_LEFT:
							if(index == 0) break;
							tools[index].removeClassName('active');
							tools[--index].addClassName('active');
							break;
						}
						$('toolbox').scrollTop = Math.min(Math.max(
								$('toolbox').scrollTop
								,tools[index].offsetTop + tools[index].clientHeight - $('toolbox').clientHeight
							)
							,tools[index].offsetTop
						);
						break;
					}
				}
				break;

			// (1 - 6) Select a tool from the toolbox
			case 49:
			case 50:
			case 51:
			case 52:
			case 53:
			case 54:
				if($('theLightbox').visible()) break;
				if($('projectLightbox').visible()) break;
				if(!$('controls').hasClassName('collapsed')) break;
				if(!adhoc.alternateKeys){ Event.stop(e);
					// Select the menu based on the typeName
					var name = adhoc.nodeTypeNames[key - (key>=53 ? 47 : 48)];
					$('toolbox').className = name;
					$$('#toolboxItems .'+name)[0].addClassName('active');
				}
				break;

			// (CTRL++) Zoom in
			case 61:
				if(adhoc.alternateKeys){ Event.stop(e);
					adhoc.zoomIn();
				}
				break;

			// (CTRL+-) Zoom out
			case 173:
				if(adhoc.alternateKeys){ Event.stop(e);
					adhoc.zoomOut();
				}
				break;

			// (CTRL+a) Select generated code
			case 65:
				if(adhoc.alternateKeys){
					if($('output').visible()){ Event.stop(e);
						adhoc.selectText($('generatedCode'));
					}else if(adhoc.selectedNode && !$('theLightbox').visible()){ Event.stop(e);
						adhoc.promptAnalysis(adhoc.selectedNode);
					}
				}
				break;

			// (CTRL+g) Generate code!
			case 71:
				if(adhoc.alternateKeys){ Event.stop(e);
					adhoc.generateCode();
				}
				break;

			// (CTRL+h) Show help
			case 72:
				if(adhoc.alternateKeys){ Event.stop(e);
					adhoc.help();
				}
				break;

			// (CTRL+j) Popup of all actions by name
			case 74:
				if(adhoc.alternateKeys){ Event.stop(e);
					adhoc.promptActionList();
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
				if(adhoc.alternateKeys && !$('theLightbox').visible()){ Event.stop(e);
					$('projectLightbox').show();
				}
				break;

			// (CTRL+s) Save a file
			case 83:
				if(adhoc.alternateKeys && !$('theLightbox').visible()){ Event.stop(e);
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
			var key = e.which || !window.event || window.event.keyCode;
			switch(key){
			// (CTRL/CMD) Set alternamte key mode off
			case Event.KEY_CONTROL:
			case Event.KEY_COMMAND1:
			case Event.KEY_COMMAND2:
			case Event.KEY_COMMAND3:
				adhoc.alternateKeys = false;
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
		$('zoomIn').observe('click', adhoc.zoomIn);
		$('zoomOut').observe('click', adhoc.zoomOut);

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

		// Ready the history buttons
		$('histBack').observe('click', adhoc.history.undo);
		$('histFwd').observe('click', adhoc.history.redo);

		// Bind to the window
		window.adhoc = adhoc;
	}

	// Generate the next available node ID
	adhoc.nextId = function(){
		return ++adhoc.lastId;
	}
	/** Create a new node with just a type and empty contents
	* @param i - The new node's id, typically null
	* @param p - The new node's parent node (optional only for the root)
	* @param r - (optional) An existing node to replace
	* @param t - (optional) The new node's node type
	* @param w - (optional) The new node's which
	* @param c - (optional) The new node's child type
	* @param k - (optional) The new node's package
	* @param n - (optional) The new node's name
	* @param v - (optional) The new node's value
	* @param f - (optional) The id of the node the new node will reference
	*/
	adhoc.createNode = function(i, p, r, t, w, c, k, n, v, f){
//TODO: add datatype and childdatatype
		// Set the type, which, and childType if they're not passed
		if(!t) t = adhoc.nodeTypes.TYPE_NULL;
		if(!w) w = adhoc.nodeWhich.WHICH_NULL;
		if(!c) c = adhoc.nodeChildType.CHILD_NULL;

		// Create an index node for children of arrays/hashes/structs
		if(p && c!=adhoc.nodeChildType.INDEX){
			// Index for an array
			if(p.which==adhoc.nodeWhich.LITERAL_ARRAY){
				// Create the new index
				p = adhoc.createNode(
					null
					,p
					,r
					,adhoc.nodeTypes.LITERAL
					,adhoc.nodeWhich.LITERAL_INT
					,adhoc.nodeChildType.INDEX
					,k
					,null
					,p.children.length
					,null
				);
				r = p.children.length ? p.children[0] : null;

			// index for a hash
			}else if(p.which==adhoc.nodeWhich.LITERAL_HASH){
				// Children added directly become indices
				c = adhoc.nodeChildType.INDEX;
			}
		}

		// Create the object with its params
		var newNode = {
			id: (i ? i : ((t == adhoc.nodeTypes.TYPE_NULL) ? null : adhoc.nextId()))
			,parent: p
			,scope: null
			,referenceId: f ? parseInt(f) : null
			,nodeType: t
			,which: w
			,childType: c
			,dataType: adhoc.nodeDataTypes.VOID
			,childDataType: adhoc.nodeDataTypes.VOID
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
			,folded: false
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

		// Add to the list of all nodes
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
				if(p.childType == adhoc.nodeChildType.INDEX) neededChildren = adhoc.nodeWhichChildren[0][1];
				if(c == adhoc.nodeChildType.INDEX) neededChildren = adhoc.nodeWhichChildren[0][2];
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
			if(t == adhoc.nodeTypes.VARIABLE){
				var searchFunc = adhoc.genScopeSearch(p, true);
				if(!searchFunc(n).length){
					var scope = p;
					while(scope.which != adhoc.nodeWhich.ACTION_DEFIN
							&& scope.which != adhoc.nodeWhich.CONTROL_LOOP){
						scope = scope.parent;
					}
					scope.scopeVars.push(newNode);
					newNode.scope = scope;
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
		if(!(w==adhoc.nodeWhich.VARIABLE_ASIGN && p && p.which!=adhoc.nodeWhich.ACTION_DEFIN)
				&& !(c==adhoc.nodeChildType.INDEX && v<0)
			){
			var neededChildren = adhoc.nodeWhichChildren[t][adhoc.nodeWhichIndices[w][1]];
			if(c == adhoc.nodeChildType.INDEX) neededChildren = adhoc.nodeWhichChildren[0][1];
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
		adhoc.setDataType(adhoc.rootNode);
		adhoc.subTreeHeightNode(adhoc.rootNode);
		adhoc.positionNode(adhoc.rootNode, 0);
		adhoc.renderNode(adhoc.rootNode);
	}

	// Recursively determine the depth of a node's subtree (including itself)
	adhoc.subTreeDepthNode = function(n){
		var maxDepth = 1;
		var countSelf = (n.childType==adhoc.nodeChildType.INDEX ? 0 : 1);
		for(var i=0; i<n.children.length; ++i){
			var d = adhoc.subTreeDepthNode(n.children[i]);
			if(d+countSelf > maxDepth) maxDepth = d+countSelf;
		}
		return maxDepth;
	}
	// Recursively determine the display heights of each subtree
	adhoc.subTreeHeightNode = function(n){
		var isHolder = n.nodeType == adhoc.nodeTypes.GROUP
			|| n.which == adhoc.nodeWhich.LITERAL_ARRAY
			|| n.which == adhoc.nodeWhich.LITERAL_HASH
			|| n.which == adhoc.nodeWhich.LITERAL_STRCT;
		n.subTreeHeight = 0;
		var childrenFound = false;
		if(!n.folded){
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
		}
		if(!childrenFound) n.subTreeHeight = 100;
		else if(isHolder) n.subTreeHeight += 30;
		return n.subTreeHeight;
	}
	// Recursively determine each node's display position
	adhoc.positionNode = function(n, d, m){
		var isHolder = n.nodeType == adhoc.nodeTypes.GROUP
			|| n.which == adhoc.nodeWhich.LITERAL_ARRAY
			|| n.which == adhoc.nodeWhich.LITERAL_HASH
			|| n.which == adhoc.nodeWhich.LITERAL_STRCT;
		var passed = d ? n.y : 0;
		n.x = d*200 + 100 + (m ? adhoc.movingNode.movePos.x : 0);
		n.y = n.subTreeHeight/2 + 20 + passed + (m ? adhoc.movingNode.movePos.y : 0);
		if(!n.folded){
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
					,d + (isHolder?0:1)
					,(m||n.detached) ? true : false
				);
			}
		}
	}

	// Recursively draw each node
	adhoc.renderNode = function(n){
		// Skip placeholders
		if(n.childType==adhoc.nodeChildType.INDEX && n.value<0) return;

		// Process the children recursively
		var c, maxWidth=30;
		if(!n.folded){
			for(var i=0; i<n.children.length; ++i){
				// Get one child
				c = n.children[i];

				// Skip null placeholders when setting is disabled
				if(c.nodeType==adhoc.nodeTypes.TYPE_NULL
						&& !adhoc.setting('showNullNodes')
						&& !adhoc.setting('dbg'))
					continue;

				// Render the child
				adhoc.renderNode(c);
				if(c.width > maxWidth) maxWidth = c.width;
			}
		}

		// Reset canvas parameters
		var ctx = adhoc.canvas.getContext('2d');
		ctx.setLineDash = ctx.setLineDash || function(args){};
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
			var hasChildren = adhoc.countChildrenOfType(n, null, true);
			n.width = (hasChildren ? maxWidth+10 : 40);
			n.height = (hasChildren ? n.subTreeHeight+10 : 40);

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
			case adhoc.nodeWhich.LITERAL_HASH:
				// Determine the right color
				nodeColor = adhoc.setting('colorScheme')=='dark' ? '#FFFFFF' : '#000000';

				// Set the array's dimensions by the size of its subtree
				var hasChildren = adhoc.countChildrenOfType(n, null, true);
				n.width = (hasChildren ? 110 : 40);
				n.height = (hasChildren ? n.subTreeHeight+10 : 40);

				// Draw the brackets
				ctx.strokeStyle = nodeColor;
				ctx.beginPath();
				ctx.moveTo(
					(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
					,(n.y-(n.height/2.0)+10) * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
					,(n.y-(n.height/2.0)) * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x+(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
					,(n.y-(n.height/2.0)) * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x+(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
					,(n.y-(n.height/2.0)+10) * adhoc.display_scale - adhoc.display_y
				);
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(
					(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0)-10) * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0)) * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x+(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0)) * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x+(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0)-10) * adhoc.display_scale - adhoc.display_y
				);
				ctx.stroke();
				break;

			case adhoc.nodeWhich.LITERAL_STRCT:
				break;

			}
			break;
		}

		// Process the child connectors recursively, if not folded
		if(!n.folded){
			for(var i=0; i<n.children.length; ++i){
				// Draw a connecting arrow except for groups and complex literals
				if(n.nodeType == adhoc.nodeTypes.GROUP
						|| n.which == adhoc.nodeWhich.LITERAL_ARRAY
						|| n.which == adhoc.nodeWhich.LITERAL_HASH
						|| n.which == adhoc.nodeWhich.LITERAL_STRCT
					) continue;
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

		// If folded, display fold line
		}else{
			for(var i=0; i<n.children.length; ++i){
				c = n.children[i];
				if(c.nodeType==adhoc.nodeTypes.TYPE_NULL
						&& !adhoc.setting('showNullNodes')
						&& !adhoc.setting('dbg'))
					continue;

				ctx.strokeStyle = '#5F87AF';
				ctx.beginPath();
				ctx.moveTo(
					(n.x+(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
					,n.y * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x+(n.width/2.0)+100) * adhoc.display_scale - adhoc.display_x
					,n.y * adhoc.display_scale - adhoc.display_y
				);
				ctx.stroke();
				break;
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

		// Show the node's tags
		var nodeTags = adhoc.getTagsByNode(n);
		if(nodeTags && nodeTags.length){
			var tagWidth = 0;
			ctx.setLineDash([2,2]);
			for(var i=0; i<nodeTags.length; ++i){
				var tagText = nodeTags[i];
				ctx.strokeStyle = nodeColor;
				ctx.fillStyle = adhoc.setting('colorScheme')=='dark' ? adhoc.textColorDark : adhoc.textColor;
				ctx.lineWidth = (2.0*adhoc.display_scale)<<0;
				ctx.font = ((12.0*adhoc.display_scale)<<0)+'px Arial';
				var size = ctx.measureText(tagText);
				if(tagWidth+(size.width/adhoc.display_scale)+14 > n.width){
					tagText = "...";
					size = ctx.measureText(tagText);
					i = nodeTags.length;
				}
				ctx.fillText(
					tagText
					,(n.x-(n.width/2.0)+5+tagWidth) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0)-6) * adhoc.display_scale - adhoc.display_y
				);
				ctx.strokeRect(
					(n.x-(n.width/2.0)+tagWidth) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0)-20) * adhoc.display_scale - adhoc.display_y
					,(size.width+10) * adhoc.display_scale
					,20 * adhoc.display_scale
				);
				tagWidth += size.width+14;
			}
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
		// Skip folded nodes
		if(n.parent && n.parent.folded) return null;

		// Check the children
		for(var i=0; i<n.children.length; ++i){
			var temp = adhoc.getClickedNode(n.children[i], click);
			if(temp) return temp;
		}

		// Skip array indices
		if(n.childType == adhoc.nodeChildType.INDEX &&
				n.parent.which == adhoc.nodeWhich.LITERAL_ARRAY)
			return null;

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
		// Skip folded nodes
		if(n.parent && n.parent.folded) return best;

		// Skip detached blocks and indices
		if(n.detached) return best;

		// Get the distance to this node (skip index nodes)
		if(n.childType != adhoc.nodeChildType.INDEX){
			var x = Math.max(0, Math.abs(click.x-n.x)-(n.width/2.0));
			var y = Math.max(0, Math.abs(click.y-n.y)-(n.height/2.0));
			var dist = Math.sqrt(x*x + y*y);
			if(dist <= best[1]){
				best[0] = n;
				best[1] = dist;
			}
		}

		// Check the children
		for(var i=0; i<n.children.length; ++i){
			best = adhoc.getClosestNode(n.children[i], best, click);
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
			if(prnt.childType == adhoc.nodeChildType.INDEX) neededChildren = adhoc.nodeWhichChildren[0][1];
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
	// Collapses / expands a node
	adhoc.foldNode = function(n){
		if(!n.children.length) return;
		n.folded = !n.folded;
		adhoc.refreshRender();
	}
	// Zooms the view in
	adhoc.zoomIn = function(){
		var center_x = (adhoc.display_x + parseFloat(adhoc.canvas.getAttribute('width'))/2.0)/adhoc.display_scale;
		var center_y = (adhoc.display_y + parseFloat(adhoc.canvas.getAttribute('height'))/2.0)/adhoc.display_scale;
		if($('zoomIn').hasClassName('disabled')) return;
		$('zoomPrcent').update(((adhoc.display_scale *= 1.2)*100).toPrecision(3));
		if(adhoc.display_scale > 8) $('zoomIn').addClassName('disabled');
		$('zoomOut').removeClassName('disabled');
		adhoc.display_x = center_x*adhoc.display_scale - parseFloat(adhoc.canvas.getAttribute('width'))/2.0;
		adhoc.display_y = center_y*adhoc.display_scale - parseFloat(adhoc.canvas.getAttribute('height'))/2.0;
		adhoc.refreshRender();
	}
	// Zooms the view out
	adhoc.zoomOut = function(){
		var center_x = (adhoc.display_x + parseFloat(adhoc.canvas.getAttribute('width'))/2.0)/adhoc.display_scale;
		var center_y = (adhoc.display_y + parseFloat(adhoc.canvas.getAttribute('height'))/2.0)/adhoc.display_scale;
		if($('zoomOut').hasClassName('disabled')) return;
		$('zoomPrcent').update(((adhoc.display_scale /= 1.2)*100).toPrecision(3));
		if(adhoc.display_scale < 0.12) $('zoomOut').addClassName('disabled');
		$('zoomIn').removeClassName('disabled');
		adhoc.display_x = center_x*adhoc.display_scale - parseFloat(adhoc.canvas.getAttribute('width'))/2.0;
		adhoc.display_y = center_y*adhoc.display_scale - parseFloat(adhoc.canvas.getAttribute('height'))/2.0;
		adhoc.refreshRender();
	}
	// Pans the canvas to the specified node
	adhoc.snapToNode = function(n, leftAlign){
		if(leftAlign){
			adhoc.display_x = (n.x - n.width/2.0 - 10)*adhoc.display_scale;
		}else{
			adhoc.display_x = (n.x + n.width/2.0)*adhoc.display_scale - parseFloat(adhoc.canvas.getAttribute('width'))/2.0;
		}
		adhoc.display_y = (n.y + n.height/2.0)*adhoc.display_scale - parseFloat(adhoc.canvas.getAttribute('height'))/2.0;
		adhoc.refreshRender();
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
							,reminder: (myScope.which==adhoc.nodeWhich.CONTROL_LOOP ? '(Loop)' : myScope.name)
							,hidden: myScope.scopeVars[i].id
							,code: false
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
			if((exact && n==part) || (!exact && n.match(new RegExp('^'+part, 'i')))){
				out.push({
					value: n
					,reminder: adhoc.registeredActions[i].package
					,hidden: adhoc.registeredActions[i].id
					,code: false
				});
			}
		}
		// If only checking package, return early
		if(packageOnly) return out;

		// Then search system actions
		for(var i=0; i<adhoc.systemActions.length; ++i){
			// If one matches, add it to the output array
			var n = adhoc.systemActions[i].name;
			if((exact && n==part) || (!exact && n.match(new RegExp('^'+part, 'i')))){
				out.push({
					value: n
					,reminder: 'System'
					,hidden: null
					,code: false
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
			if(prnt.children[i].childType == adhoc.nodeChildType.INDEX && prnt.children[i].value<0) continue;
			if((prnt.children[i].childType == childType) || !childType) ++count;
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
	// Pop up the help pane
	adhoc.help = function(){
		adhoc.promptIFrame('ADHOC Help', 'help.php');
	}
	// Compare two types for casting
	adhoc.resolveTypes = function(a, b){
		// Handle edge cases
		if(a == adhoc.nodeDataTypes.TYPE_MIXED
				|| b == adhoc.nodeDataTypes.TYPE_MIXED
				|| a == adhoc.nodeDataTypes.TYPE_ACTN
				|| b == adhoc.nodeDataTypes.TYPE_ACTN
				|| a == adhoc.nodeDataTypes.TYPE_STRCT
				|| b == adhoc.nodeDataTypes.TYPE_STRCT
				|| a == adhoc.nodeDataTypes.VOID
				|| b == adhoc.nodeDataTypes.VOID
			) return adhoc.nodeDataTypes.VOID;
		if(a == b) return a;
		if(a < b) return adhoc.resolveTypes(b, a);
		if(a==adhoc.nodeDataTypes.TYPE_HASH && b==adhoc.nodeDataTypes.TYPE_ARRAY)
			return adhoc.nodeDataTypes.TYPE_HASH;
		if(a == adhoc.nodeDataTypes.TYPE_HASH) return adhoc.nodeDataTypes.VOID;
		if(a == adhoc.nodeDataTypes.TYPE_ARRAY) return adhoc.nodeDataTypes.VOID;

		// Handle casts
		return a;
	}
	// Set a node's dataType from context
	adhoc.setDataType = function(n){
		// Set this node's children's types
		for(var i=0; i<n.children.length; ++i){
			adhoc.setDataType(n.children[i]);
		}

		// Default dataTypes
		var dt = adhoc.nodeDataTypes.VOID;
		var cdt = adhoc.nodeDataTypes.VOID;

		// Handle dataType checks for different which
		switch(n.which){
		case adhoc.nodeWhich.WHICH_NULL:
		case adhoc.nodeWhich.GROUP_SERIAL:
		case adhoc.nodeWhich.CONTROL_IF:
		case adhoc.nodeWhich.CONTROL_LOOP:
		case adhoc.nodeWhich.CONTROL_SWITCH:
		case adhoc.nodeWhich.CONTROL_CASE:
		case adhoc.nodeWhich.CONTROL_FORK:
		case adhoc.nodeWhich.CONTROL_CNTNU:
		case adhoc.nodeWhich.CONTROL_BREAK:
			dt = adhoc.nodeDataTypes.VOID;
			cdt = adhoc.nodeDataTypes.VOID;
			break;

		case adhoc.nodeWhich.ACTION_DEFIN:
			var retTypes = adhoc.getReturnedDataTypes(n);
			dt = retTypes[0];
			cdt = retTypes[1];
			break;

		case adhoc.nodeWhich.ACTION_CALL:
			if(n.package == 'System'){
				// TODO
			}else if(n.referenceId && adhoc.allNodes[n.referenceId]){
				dt = adhoc.allNodes[n.referenceId].dataType;
				cdt = adhoc.allNodes[n.referenceId].childDataType;
			}
			break;

		case adhoc.nodeWhich.CONTROL_RETRN:
			if(n.children.length){
				dt = n.children[0].dataType;
				cdt = n.children[0].childDataType;
			}
			break;

		case adhoc.nodeWhich.OPERATOR_PLUS:
		case adhoc.nodeWhich.OPERATOR_MINUS:
		case adhoc.nodeWhich.OPERATOR_TIMES:
		case adhoc.nodeWhich.OPERATOR_DIVBY:
		case adhoc.nodeWhich.OPERATOR_MOD:
		case adhoc.nodeWhich.OPERATOR_EXP:
		case adhoc.nodeWhich.ASSIGNMENT_PLUS:
		case adhoc.nodeWhich.ASSIGNMENT_MINUS:
		case adhoc.nodeWhich.ASSIGNMENT_TIMES:
		case adhoc.nodeWhich.ASSIGNMENT_DIVBY:
		case adhoc.nodeWhich.ASSIGNMENT_MOD:
		case adhoc.nodeWhich.ASSIGNMENT_EXP:
			if(n.children.length == 2){
				dt = adhoc.resolveTypes(
					n.children[0].dataType
					,n.children[1].dataType
				);
				cdt = adhoc.resolveTypes(
					n.children[0].childDataType
					,n.children[1].childDataType
				);
			}
			break;

		case adhoc.nodeWhich.OPERATOR_OR:
		case adhoc.nodeWhich.OPERATOR_AND:
		case adhoc.nodeWhich.OPERATOR_NOT:
		case adhoc.nodeWhich.OPERATOR_EQUIV:
		case adhoc.nodeWhich.OPERATOR_GRTTN:
		case adhoc.nodeWhich.OPERATOR_LESTN:
		case adhoc.nodeWhich.OPERATOR_GRTEQ:
		case adhoc.nodeWhich.OPERATOR_LESEQ:
		case adhoc.nodeWhich.OPERATOR_NOTEQ:
		case adhoc.nodeWhich.ASSIGNMENT_NEGPR:
		case adhoc.nodeWhich.ASSIGNMENT_NEGPS:
		case adhoc.nodeWhich.ASSIGNMENT_OR:
		case adhoc.nodeWhich.ASSIGNMENT_AND:
			dt = adhoc.nodeDataTypes.BOOL;
			cdt = adhoc.nodeDataTypes.VOID;
			break;

		case adhoc.nodeWhich.OPERATOR_ARIND:
			if(n.children.length){
				dt = n.children[0].childDataType;
				cdt = adhoc.nodeDataTypes.MIXED;
			}
			break;

		case adhoc.nodeWhich.OPERATOR_TRNIF:
			if(n.children.length == 3){
				dt = adhoc.resolveTypes(
					n.children[1].dataType
					,n.children[2].dataType
				);
				cdt = adhoc.resolveTypes(
					n.children[1].childDataType
					,n.children[2].childDataType
				);
			}
			break;

		case adhoc.nodeWhich.ASSIGNMENT_INCPR:
		case adhoc.nodeWhich.ASSIGNMENT_INCPS:
		case adhoc.nodeWhich.ASSIGNMENT_DECPR:
		case adhoc.nodeWhich.ASSIGNMENT_DECPS:
			if(n.children.length){
				dt = n.children[0].dataType;
				cdt = n.children[0].childDataType;
			}
			break;

		case adhoc.nodeWhich.ASSIGNMENT_EQUAL:
			if(n.children.length == 2){
				dt = n.children[1].dataType;
				cdt = n.children[1].childDataType;
				n.children[0].dataType = dt;
				n.children[0].childDataType = cdt;
			}
			break;

		case adhoc.nodeWhich.VARIABLE_ASIGN:
			if(n.children.length && (
					n.childType == adhoc.nodeChildType.PARAMETER
					|| n.childType == adhoc.nodeChildType.INITIALIZATION
				)){
				dt = n.children[0].dataType;
				cdt = n.children[0].childDataType;
			}else{
				dt = n.dataType;
				cdt = n.childDataType;
			}
			break;

		case adhoc.nodeWhich.VARIABLE_EVAL:
			if(n.referenceId && adhoc.allNodes[n.referenceId]){
				dt = adhoc.allNodes[n.referenceId].dataType;
				cdt = adhoc.allNodes[n.referenceId].childDataType;
			}
			break;

		case adhoc.nodeWhich.LITERAL_BOOL:
			dt = adhoc.nodeDataTypes.BOOL;
			cdt = adhoc.nodeDataTypes.VOID;
			break;

		case adhoc.nodeWhich.LITERAL_INT:
			dt = adhoc.nodeDataTypes.INT;
			cdt = adhoc.nodeDataTypes.VOID;
			break;

		case adhoc.nodeWhich.LITERAL_FLOAT:
			dt = adhoc.nodeDataTypes.FLOAT;
			cdt = adhoc.nodeDataTypes.VOID;
			break;

		case adhoc.nodeWhich.LITERAL_STRNG:
			dt = adhoc.nodeDataTypes.STRING;
			cdt = adhoc.nodeDataTypes.VOID;
			break;

		case adhoc.nodeWhich.LITERAL_ARRAY:
			dt = adhoc.nodeDataTypes.ARRAY;
		case adhoc.nodeWhich.LITERAL_HASH:
			dt = dt || adhoc.nodeDataTypes.HASH;
			cdt = n.childDataType;
			for(var i=0; i<n.children.length; ++i){
				if(cdt != n.children[i].children[0].dataType){
					cdt = adhoc.nodeDataTypes.MIXED;
					break;
				}
			}
			break;

		case adhoc.nodeWhich.LITERAL_STRCT:
			dt = adhoc.nodeDataTypes.STRCT;
			cdt = adhoc.nodeDataTypes.VOID;
			break;
		}
		n.dataType = dt;
		n.childDataType = cdt;
	}
	// Determine what datatypes a statement can return
	adhoc.getReturnedDataTypes = function(n){
		var dt = adhoc.nodeDataTypes.VOID;
		var cdt = adhoc.nodeDataTypes.VOID;
		for(var i=0; i<n.children.length; ++i){
			// Check the type of a control-return
			if(n.children[i].which == adhoc.nodeWhich.CONTROL_RETRN){
				var tempDt = n.children[i].dataType;
				var tempCdt = n.children[i].childDataType;
			// Check the type of statement which may contain
			}else if(n.children[i].childType == adhoc.nodeChildType.STATEMENT
					|| n.children[i].childType == adhoc.nodeChildType.CASE
					|| n.children[i].childType == adhoc.nodeChildType.PARENT
					|| n.children[i].childType == adhoc.nodeChildType.CHILD
					|| n.children[i].childType == adhoc.nodeChildType.IF
					|| n.children[i].childType == adhoc.nodeChildType.ELSE
				){
				var tempBoth = adhoc.getReturnedDataTypes(n.children[i]);
				tempDt = tempBoth[0];
				tempCdt = tempBoth[1];
			}else continue;

			if(dt == adhoc.nodeDataTypes.VOID){
				dt = tempDt;
				cdt = tempCdt;
			}
			if(tempDt==adhoc.nodeDataTypes.MIXED || dt!=tempDt){
				dt = adhoc.nodeDataTypes.MIXED;
				cdt = adhoc.nodeDataTypes.MIXED;
				break;
			}
		}
		return [tempDt, tempCdt];
	}

	// Function to serialize a node and its children for binary
	adhoc.serialize = function(n){
		var out =
			adhoc.intTo3Byte(n.id)
			+ adhoc.intTo3Byte(n.parent ? n.parent.id : 0)
			+ adhoc.intTo3Byte(n.referenceId ? n.referenceId : 0)
			+ adhoc.intTo3Byte(n.nodeType)
			+ adhoc.intTo3Byte(n.which)
			+ adhoc.intTo3Byte(n.childType)
			+ adhoc.intTo3Byte(n.dataType)
			+ adhoc.intTo3Byte(n.childDataType)
			+ '"' + (n.package ? n.package : 'NULL') + '"'
			+ '"' + (n.name ? n.name : 'NULL') + '"'
			+ '"' + ((n.value!==null&&n.value!==undefined) ? n.value : 'NULL') + '"';
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
		tempNode.referenceId = adhoc.intFrom3Byte(s.substr(6, 3));
		tempNode.nodeType = adhoc.intFrom3Byte(s.substr(9, 3));
		tempNode.which = adhoc.intFrom3Byte(s.substr(12, 3));
		tempNode.childType = adhoc.intFrom3Byte(s.substr(15, 3));
		tempNode.dataType = adhoc.intFrom3Byte(s.substr(18, 3));
		tempNode.childDataType = adhoc.intFrom3Byte(s.substr(21, 3));
		var found = 1;
		var offset = 25;
		while(found<6){
			offset = s.indexOf('"', offset+1);
			if(s.charAt(offset-1) == "\\") continue;
			++found;
		}
		var parts = s.substring(25, offset).split('""');
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
			,tempNode.referenceId
		);
		if(tempNode.dataType){
			newNode.dataType = tempNode.dataType;
			newNode.childDataType = tempNode.childDataType;
		}else if(newNode.parent && newNode.parent.childType==adhoc.nodeChildType.INDEX){
			newNode.dataType = newNode.parent.parent.childDataType;
		}
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
			,childDataType: n.childDataType
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
			,tags: adhoc.allTags[n.id]
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

	// Renames a single node, and possibly the package of its children
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
	// Changes the tags on a node
	adhoc.changeTags = function(n, tagString){
		// Determine if this action should be bound, then record it
		var prevAction = adhoc.history.index>0 ? adhoc.history.history[adhoc.history.index-1] : null;
		var ref1 = n.referenceId
			? n.referenceId
			: n.id;
		if(prevAction){
			var ref2 = adhoc.allNodes[prevAction.parentId].referenceId
				? adhoc.allNodes[prevAction.parentId].referenceId
				: prevAction.parentId;
		}else{
			var ref2 = null;
		}
		var bind = prevAction
			&& ref1 == ref2
			&& (['rename','tags','datatype','childdatatype','comment'].indexOf(prevAction.action) >= 0);
		adhoc.history.record('tags', tagString, n, false);

		// Change the actual tags
		var newTags = [];
		var tags = tagString.split(',');
		for(var i=0; i<tags.length; ++i){
			var t = tags[i].trim("\\s");
			if(t) newTags.push(t);
		}
		adhoc.allTags[n.id] = newTags;
	}
	// Changes the dataType of a single node
	adhoc.changeDatatype = function(n, type){
		// If this is a reference, go for the main node
		if(n.referenceId){
			return adhoc.changeDatatype(adhoc.allNodes[n.referenceId], type);
		}

		// Determine if this action should be bound, then record it
		var prevAction = adhoc.history.index>0 ? adhoc.history.history[adhoc.history.index-1] : null;
		var ref1 = n.referenceId
			? n.referenceId
			: n.id;
		if(prevAction){
			var ref2 = adhoc.allNodes[prevAction.parentId].referenceId
				? adhoc.allNodes[prevAction.parentId].referenceId
				: prevAction.parentId;
		}else{
			var ref2 = null;
		}
		var bind = prevAction
			&& ref1 == ref2
			&& (['rename','tags','datatype','childdatatype','comment'].indexOf(prevAction.action) >= 0);
		adhoc.history.record('datatype', type, n, bind);

		// Change this node's type and the types of all its references
		n.dataType = type;
		for(var i=0; i<n.references.length; ++i){
			adhoc.history.record('datatype', type, adhoc.allNodes[n.references[i]], true);
			adhoc.allNodes[n.references[i]].dataType = type;
		}
	}
	// Changes the childDataType of a single node
	adhoc.changeChildDataType = function(n, type){
		// If this is a reference, go for the main node
		if(n.referenceId){
			return adhoc.changeChildDataType(adhoc.allNodes[n.referenceId], type);
		}

		// Determine if this action should be bound, then record it
		var prevAction = adhoc.history.index>0 ? adhoc.history.history[adhoc.history.index-1] : null;
		var ref1 = n.referenceId
			? n.referenceId
			: n.id;
		if(prevAction){
			var ref2 = adhoc.allNodes[prevAction.parentId].referenceId
				? adhoc.allNodes[prevAction.parentId].referenceId
				: prevAction.parentId;
		}else{
			var ref2 = null;
		}
		var bind = prevAction
			&& ref1 == ref2
			&& (['rename','tags','datatype','childdatatype','comment'].indexOf(prevAction.action) >= 0);
		adhoc.history.record('childdatatype', type, n, bind);

		// Change this node's child datatype and the types of all its references
		n.childDataType = type;
		for(var i=0; i<n.references.length; ++i){
			adhoc.history.record('childdatatype', type, adhoc.allNodes[n.references[i]], true);
			adhoc.allNodes[n.references[i]].childDataType = type;
		}
	}
	// Changes the comment on a single node
	adhoc.changeComment = function(n, cmnt){
		var prevAction = adhoc.history.index>0 ? adhoc.history.history[adhoc.history.index-1] : null;
		var bind = prevAction
			&& prevAction.parentId==n.id
			&& (['rename','tags','datatype','childdatatype','comment'].indexOf(prevAction.action) >= 0);
		adhoc.history.record('comment', cmnt, n, bind);
		n.value = cmnt ? cmnt : null;
	}
	// Changes the package name of all children
	adhoc.updatePackageName = function(n, oldP, newP){
		if(n.package == newP) return;
		if(n.package == oldP) n.package = newP;
		if(n.children){
			for(var i=0; i<n.children.length; ++i){
				adhoc.updatePackageName(n.children[i], oldP, newP);
			}
		}
		if(n.references){
			for(var i=0; i<n.references.length; ++i){
				adhoc.updatePackageName(n.references[i], oldP, newP);
			}
		}
	}
	// Reset the indices of a container-type node
	adhoc.resetIndices = function(n){
		if(n.which == adhoc.nodeWhich.LITERAL_ARRAY){
			for(var i=0; i<n.children.length; ++i){
				n.children[i].value = i;
			}
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
			if(p1.childType == adhoc.nodeChildType.INDEX) neededChildren = adhoc.nodeWhichChildren[0][1];
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

			// Reset parent's indicies, if it's an array
			if(p1.childType == adhoc.nodeChildType.INDEX
					&& p1.parent.which == adhoc.nodeWhich.LITERAL_ARRAY
				){
				var p1p = p1.parent;
				adhoc.deleteNode(p1);
				adhoc.resetIndices(p1p);
			}
		}

		// If moving to an array, add an index
		var r = adhoc.getFirstNullChildByType(p2, n.childType);
		if(p2.which==adhoc.nodeWhich.LITERAL_ARRAY){
			p2 = adhoc.createNode(
				null
				,p2
				,r
				,adhoc.nodeTypes.LITERAL
				,adhoc.nodeWhich.LITERAL_INT
				,adhoc.nodeChildType.INDEX
				,p2.package
				,null
				,p2.children.length
				,null
			);
			r = p2.children.length ? p2.children[0] : null;
		}

		// Add to the new parent (assume validity has been checked)
		n.parent = p2;
		// Replace null if possible
		if(r) p2.children[p2.children.indexOf(r)] = n;
		// Otherwise, find proper location
		else{
			var pp=0
				,pc=0
				,reached=false
				,neededChildren=adhoc.nodeWhichChildren[p2.nodeType][adhoc.nodeWhichIndices[p2.which][1]]
				;
			if(p2.childType == adhoc.nodeChildType.INDEX) neededChildren = adhoc.nodeWhichChildren[0][1];
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
			if(n.parent.childType == adhoc.nodeChildType.INDEX) neededChildren = adhoc.nodeWhichChildren[0][1];
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

			// Reset parent's indicies, if it's an array
			if(n.parent.childType == adhoc.nodeChildType.INDEX
					&& n.parent.parent.which == adhoc.nodeWhich.LITERAL_ARRAY
				){
				adhoc.resetIndices(n.parent.parent);
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
			n.childDataType = newNode.childDataType;
			n.package = newNode.package;
			n.name = newNode.name;
			n.value = newNode.value;
			n.references = newNode.references;
			n.x = newNode.x;
			n.y = newNode.y;
			n.highlighted = newNode.highlighted;
			n.detached = newNode.detached;
			n.moveClick = newNode.moveClick;
			n.moveTarget = newNode.moveTarget;
			n.movePos = newNode.movePos;
			n.width = newNode.width;
			n.height = newNode.height;
			n.subTreeHeight = newNode.subTreeHeight;
			adhoc.allTags[newNode.id] = newNode.tags;

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
				if(n.parent.childType == adhoc.nodeChildType.INDEX) neededChildren = adhoc.nodeWhichChildren[0][1];
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
	// Rebase node IDs (debugging features)
	adhoc.rebaseAllNodeIds = function(){
		adhoc.lastId = 0;
		adhoc.newIds = [];
		adhoc.allNodes = [];
		adhoc.rebaseNodeId(adhoc.rootNode);
		for(var i=1; i<adhoc.lastId; ++i){
			var n = adhoc.allNodes[i];
			n.referenceId = adhoc.newIds[n.referenceId];
			for(var j=0; j<n.references.length; ++j){
				n.references[j] = adhoc.newIds[n.references[j]];
			}
		}
		delete adhoc.newIds;
		if(adhoc.setting('username')){
			$('savePackageButton').removeClassName('disabled');
			$('savePackageButton').update('Save');
		}
	}
	adhoc.rebaseNodeId = function(n){
		if(!n || !n.id) return;
		var oldId = n.id;
		var newId = ++adhoc.lastId;
		adhoc.newIds[oldId] = newId;
		adhoc.allNodes[newId] = n;
		n.id = newId;
		for(var i=0; i<n.children.length; ++i){
			adhoc.rebaseNodeId(n.children[i]);
		}
	}

	// Apply multiple tags to nodes by id
	adhoc.applyTags = function(nodeTags){
		if(!nodeTags) return;
		for(var i in nodeTags){
			var tags = nodeTags[typeof(i)=="number" ? i : parseInt(i)];
			if(!adhoc.allTags[i]) adhoc.allTags[i] = [];
			for(var j=0; j<tags.length; ++j){
				adhoc.allTags[i].push(tags[j]);
			}
		}
	}
	// Get back a pruned list of tags from all the nodes
	adhoc.gleanTags = function(){
		var ret = {};
		for(var i in adhoc.allTags){
			if(adhoc.allTags[i] && adhoc.allTags[i].length)
				ret[i] = adhoc.allTags[i];
		}
		return ret;
	}
	// Get the tags associated with a particular node
	adhoc.getTagsByNode = function(n){
		if(!n.id) return [];
		if(!adhoc.allTags[n.id]) adhoc.allTags[n.id] = [];
		return adhoc.allTags[n.id];
	}
	// Get the nodes associated with a particular tag
	adhoc.getNodesByTag = function(t){
		ret = [];
		for(var i in adhoc.allTags){
			if(adhoc.allTags[i].indexOf(t) >= 0) ret.push(adhoc.allNodes[i]);
		}
		return ret;
	}

	// Analyze a node using ADHOC heuristics!
	adhoc.analyzeNode = function(n){
		var a = {
			totalLoops: (n.which==adhoc.nodeWhich.CONTROL_LOOP?1:0)
			,maxLoopNest: (n.which==adhoc.nodeWhich.CONTROL_LOOP?1:0)
			,returns: (n.which==adhoc.nodeWhich.CONTROL_RETRN?1:0)
			,conditionalReturns: 0
			,actionVerb: n.name ? n.name.split(' ')[0] : ''
			,nodeCount: 1
			,childCount: n.children.length
			,inputTypes: [0,0,0,0,0,0,0,0,0,0]
			,outputType: n.dataType || adhoc.nodeDataTypes.VOID
			,actionsCalled: '?'
			,tags: adhoc.getTagsByNode(n)
		};
		var myMaxLoopNest = a.maxLoopNest;
		for(var i=0; i<n.children.length; ++i){
			var c = n.children[i];
			var ca = adhoc.analyzeNode(c);
			a.totalLoops += ca.totalLoops;
			a.maxLoopNest = Math.max(a.maxLoopNest, ca.maxLoopNest+myMaxLoopNest);
			(a.conditionalReturns =
				a.conditionalReturns
				|| ca.conditionalReturns
				|| ca.returns && (
					c.which == adhoc.nodeWhich.CONTROL_IF
					|| c.which == adhoc.nodeWhich.CONTROL_LOOP
					|| c.which == adhoc.nodeWhich.CONTROL_CASE
					|| c.which == adhoc.nodeWhich.CONTROL_FORK
				)
			) ? 1 : 0;
			a.nodeCount += ca.nodeCount;
			if(c.childType == adhoc.nodeChildType.PARAMETER)
				++a.inputTypes[c.dataType || adhoc.nodeDataTypes.VOID];
		}
		return a;
	}

	// New package
	adhoc.newProject = function(){
		adhoc.promptFlag('New Package: Are you sure?', ['Yes','No'], function(val){
			if(val == 1) return;
			// Reset globals
			adhoc.selectedNode = null;
			adhoc.display_scale = 1.0;
			adhoc.display_x = 0;
			adhoc.display_y = 0;
			adhoc.lastId = 0;
			adhoc.registeredActions = [];
			adhoc.allNodes = [];
			adhoc.allTags = {};
			adhoc.setting('projectName', 'New Project');

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

			// Reset controls
			$('controls').addClassName('collapsed');
			adhoc.setting('projectId', 0);
			$('projectName').value = adhoc.setting('projectName');
			if(adhoc.setting('username')){
				$('savePackageButton').removeClassName('disabled');
				$('savePackageButton').update('Save');
			}else $('savePackageButton').addClassName('disabled');
			$('zoomPrcent').update(100);
			adhoc.resetHistory();
			adhoc.refreshRender();
		});
	}
	// Save a package to storage
	adhoc.saveProject = function(){
		// Set the save button to a processing state
		$('savePackageButton').addClassName('disabled').addClassName('saving');
		$('savePackageButton').update('Saving...');

		// Call save from Ajax
		new Ajax.Request('save/', {
			parameters: {
				binary: adhoc.serialize(adhoc.rootNode)
				,projectid: adhoc.setting('projectId')
				,projectname: adhoc.setting('projectName')
				,xsrftoken: $('xsrfToken').innerHTML
			}
			,requestHeaders: {
				'ADHOC-tags': Object.toJSON(adhoc.gleanTags())
			}
			,onFailure: function(t){
				// Reactivate the save button, and report the error
				$('savePackageButton').removeClassName('disabled').removeClassName('saving');
				$('savePackageButton').update('Save');
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

				// Change the text on the save button
				$('savePackageButton').removeClassName('saving');
				$('savePackageButton').update('Saved');
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
				// Reset globals
				adhoc.selectedNode = null;
				adhoc.display_scale = 1.0;
				adhoc.display_x = 0;
				adhoc.display_y = 0;
				adhoc.lastId = 0;
				adhoc.registeredActions = [];
				adhoc.allNodes = [];
				adhoc.allTags = {};

				// Get node structure from response body and tags from headers
				adhoc.rootNode = adhoc.unserialize(t.responseText.rtrim("\\s"));
				var tagsStruct = null;
				try{ tagsStruct = t.getResponseHeader('ADHOC-tags').evalJSON(); }
				catch(e){} // tags mangled or not present
				if(tagsStruct) adhoc.applyTags(tagsStruct);

				// Reset controls
				$('controls').addClassName('collapsed');
				adhoc.setting('projectId', projectId);
				adhoc.setting('projectName', adhoc.rootNode.package);
				$('projectName').value = adhoc.setting('projectName');
				$('savePackageButton').addClassName('disabled');
				$('savePackageButton').update('Saved');
				$('zoomPrcent').update(100);
				adhoc.resetHistory();
				adhoc.refreshRender();
				adhoc.snapToNode(adhoc.rootNode, true);
			}
			,onFailure: function(t){
				adhoc.error(t.responseText);
			}
		});
	}
	// Generate code from the current file
	adhoc.generateCode = function(){
		$('generateButton').blur();
		adhoc.clearErrors(adhoc.rootNode);
		new Ajax.Request('generate/', {
			parameters: {
				binary: adhoc.serialize(adhoc.rootNode)
				,language: $F('languageChoice_input')
				,executable: (adhoc.setting('executable') ? 1 : 0)
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
				$('generatedCode').className = 'language-'+adhoc.languageHighlightClasses[$F('languageChoice_input')];
				Prism.highlightElement($('generatedCode'));
				$('output').show();
			}
		});
	}

	// Initialize the application
	adhoc.init();
});
