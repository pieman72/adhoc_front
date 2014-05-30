// Set up everything only after the page loads
Event.observe(window, 'load', function(){
	var adhoc = {};

	// Certain class globals
	adhoc.dbg = false;
	adhoc.canvas = null;
	adhoc.display_scale = 1.0;
	adhoc.display_x = 0;
	adhoc.display_y = 0;
	adhoc.textColor = '#000000';
	adhoc.lastId = 0;
	adhoc.registeredActions = [];
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
		,{label: 'If'
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
		,{label: 'Else'
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
					,min: 0
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
					childType: adhoc.nodeChildType.EXPRESSION
					,min: 3
					,max: 3
				}
			]
		]
		,[ // ASSIGNMENT
			[ // ASSIGNMENT_INCPR
				{
					childType: adhoc.nodeChildType.PARAMETER
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_INCPS
				{
					childType: adhoc.nodeChildType.PARAMETER
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_DECPR
				{
					childType: adhoc.nodeChildType.PARAMETER
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_DECPS
				{
					childType: adhoc.nodeChildType.PARAMETER
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_NEGPR
				{
					childType: adhoc.nodeChildType.PARAMETER
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_NEGPS
				{
					childType: adhoc.nodeChildType.PARAMETER
					,min: 1
					,max: 1
				}
			]
			,[ // ASSIGNMENT_EQUAL
				{
					childType: adhoc.nodeChildType.PARAMETER
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
					childType: adhoc.nodeChildType.PARAMETER
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
					childType: adhoc.nodeChildType.PARAMETER
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
					childType: adhoc.nodeChildType.PARAMETER
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
					childType: adhoc.nodeChildType.PARAMETER
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
					childType: adhoc.nodeChildType.PARAMETER
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
					childType: adhoc.nodeChildType.PARAMETER
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
					childType: adhoc.nodeChildType.PARAMETER
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
					childType: adhoc.nodeChildType.PARAMETER
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
		return false;
	}
	// Validate the name of a new identifier
	adhoc.validateIdentifier = function(v){
		if(!v.match(/^[_a-zA-Z][_a-zA-Z0-9]*$/)){
			return 'Not a valid variable name';
		}
	};
	// Validate the name of a new action
	adhoc.validateActionName = function(v){
		if(!v.match(/^[_a-zA-Z][ _a-zA-Z0-9]*$/)){
			return 'Not a valid action name';
		}
	};

	// Display errors to the user
	adhoc.error = function(s){
		// Add a title
		$$('#theLightbox .nxj_lightboxTitle')[0].update('Error');

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
	// Prompt the user for an option
	adhoc.promptFlag = function(prmpt, opts, callBack){
		// Add the prompt text as the title
		$$('#theLightbox .nxj_lightboxTitle')[0].update(prmpt);

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
			callBack(parseInt($$('#theLightbox input:checked')[0].value));
			$('theLightbox').hide();
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
		$$('#theLightbox .nxj_lightboxTitle')[0].update(prmpt);

		// Create the new lightbox content
		var cont = $(document.createElement('div'));
		cont.addClassName('nxj_lightboxContent');

		// Create a holder in case we use an autocomplete
		var holder = $(document.createElement('div'));
		holder.addClassName('searchHolder');
		cont.appendChild(holder);

		// Create and add the input field
		var inp = $(document.createElement('input'));
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
					callBack(this.value);
					$('theLightbox').hide();
				// And if it happened to be Esc, then close the lightbox
				}else if((e.keyCode||e.which) == Event.KEY_ESC){
					$('theLightbox').hide();
				}
			}
		});
		holder.appendChild(inp);

		// If a search function is provided, attach an autocomplete
		if(searchFunc){
			// Create the autocomplete list
			var acList = $(document.createElement('div'));
			acList.setAttribute('id', 'lb_input_acList');
			acList.setAttribute('style', 'display:none;');
			holder.appendChild(acList);

			// Attach the autocomplete functions to the input
			adhoc.attachAutocomplete(inp, acList, searchFunc, function(){}, vldt, sorryText);
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
			callBack(inp.value);
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
			elem.stopObserving('keyup', adhoc.autocompleteListener);
		})
	}
	// Function to attach and operate the autocomplete
	adhoc.attachAutocomplete = function(input, list, acSearchFunc, acLoadFunc, validate, acSorryText){
		// Autocomplete globals
		var acLock = null;
		var acOpen = false;

		// Handle a keypress in the autocomplete
		function acInput(evt){
			// Get the keycode from the event
			var key = evt.which || window.event.keyCode;

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
					elem.setAttribute('data-value', item.value);
					elem.update(
						item.display.replace(acRxp, '<span class="match">$1</span>')
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
			acLoadFunc(input.value);
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

	// Initialize the GUI editor
	adhoc.init = function(){
		// Activate the top control panel toggle
		$('controlsToggle').observe('click', function(){
			$('controls').toggleClassName('collapsed');
		})

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
		var cat, head, body, item, icon, text, clear, passed=0, toolbox=$('toolbox');
		for(var i=0,leni=adhoc.nodeTypeNames.length; i<leni; ++i){
			// Print section headings (except null and assignment)
			if(i!=0 && i!=5){
				// Category
				cat = $(document.createElement('div'));
				cat.addClassName('toolboxCategory');
				if(i!=1) cat.addClassName('collapsed');

				// Heading
				head = $(document.createElement('div'));
				head.addClassName('toolboxCategoryHeading').update(adhoc.nodeTypeNames[i]);
				head.observe('click', function(){
					var alreadyOpen = !this.up().hasClassName('collapsed');
					$$('.toolboxCategory').each(function(category){
						category.addClassName('collapsed');
					});
					if(!alreadyOpen) this.up().removeClassName('collapsed');
				});
				cat.appendChild(head);

				// Body
				body = $(document.createElement('div'));
				body.addClassName('toolboxCategoryBody');
				cat.appendChild(body);

				// Spacers
				clear = $(document.createElement('div'));
				clear.addClassName('clear').setStyle({height:'40px'});
				body.appendChild(clear);
				clear = $(document.createElement('div'));
				clear.addClassName('clear');
				cat.appendChild(clear);

				// Add
				toolbox.appendChild(cat);
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
				item.addClassName('toolboxItem');
				item.setAttribute('data-type', i);
				item.setAttribute('data-which', j+passed);
				item.observe('click', function(){
					var wasActive = this.hasClassName('active');
					$$('.toolboxItem.active').each(function(active){
						active.removeClassName('active');
					});
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
				body.appendChild(item);

				// Spacer
				clear = $(document.createElement('div'));
				clear.addClassName('clear');
				body.appendChild(clear);
			}
			passed += lenj;
		}

		// Ready the canvas
		var downFunc = function(e){
			// Get the scaled location of the click
			var offset = adhoc.canvas.positionedOffset();
			var click = {
				x: (Event.pointerX(e) - offset.left + adhoc.display_x) / adhoc.display_scale
				,y: (Event.pointerY(e) - offset.top + adhoc.display_y) / adhoc.display_scale
			};
			var clickedNode = adhoc.getClickedNode(adhoc.rootNode, click);

			// If a node was clicked, figure out what to do with it
			if(clickedNode){
				// nothing?

			// Otherwise, we're trying to move the canvas
			}else{
				adhoc.canvas.addClassName('moving');
				adhoc.canvas.setAttribute('data-startx', adhoc.display_x);
				adhoc.canvas.setAttribute('data-starty', adhoc.display_y);
				adhoc.canvas.setAttribute('data-startpx', Event.pointerX(e));
				adhoc.canvas.setAttribute('data-startpy', Event.pointerY(e));
			}
		};
		var upFunc = function(e){
			// We're done moving the canvas
			adhoc.canvas.removeClassName('moving');

			// Get the scaled location of the click
			var offset = adhoc.canvas.positionedOffset();
			var click = {
				x: (Event.pointerX(e) - offset.left + adhoc.display_x) / adhoc.display_scale
				,y: (Event.pointerY(e) - offset.top + adhoc.display_y) / adhoc.display_scale
			};
			var clickedNode = adhoc.getClickedNode(adhoc.rootNode, click);

			// A tool is active and a node was clicked, figure out what to do with it
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
						if(role.max!=null && adhoc.countChildrenOfType(prnt, role.childType)>=role.max) continue;
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

				// Make a callback that takes a childtype and does the rest of node creation
				var createNodeWithType = function(childType){
					// Ask for node info based on which
					switch(which){
					case adhoc.nodeWhich.ACTION_DEFIN:
						// Prompt for an action name
						adhoc.promptValue('Enter an action name:', adhoc.validateActionName, false, function(val){
							adhoc.createNode(prnt, repl, type, which, childType, null, val);
						});
						break;

					case adhoc.nodeWhich.ACTION_CALL:
						// Prompt for an action name
						adhoc.promptValue('Enter an action name:', adhoc.validateActionName, false, function(val){
							adhoc.createNode(prnt, repl, type, which, childType, null, val);
						}, adhoc.actionSearch, 'New action');
						break;

					case adhoc.nodeWhich.VARIABLE_ASIGN:
					case adhoc.nodeWhich.VARIABLE_EVAL:
						// Prompt for a variable name
						adhoc.promptValue('Enter a variable name:', adhoc.validateIdentifier, false, function(val){
							adhoc.createNode(prnt, repl, type, which, childType, null, val);
						}, adhoc.genScopeSearch(prnt, false), 'New variable');
						break;

					case adhoc.nodeWhich.LITERAL_BOOL:
						// Prompt for a boolean value
						adhoc.promptFlag('Select a boolean value:', ['true', 'false'], function(val){
							adhoc.createNode(prnt, repl, type, which, childType, null, null, !val);
						});
						break;

					case adhoc.nodeWhich.LITERAL_INT:
						// Prompt for an integer value
						adhoc.promptValue('Enter an integer:', adhoc.validateInt, true, function(val){
							adhoc.createNode(prnt, repl, type, which, childType, null, null, parseInt(val));
						});
						break;

					case adhoc.nodeWhich.LITERAL_FLOAT:
						// Prompt for a float value
						adhoc.promptValue('Enter a float:', adhoc.validateFloat, true, function(val){
							adhoc.createNode(prnt, repl, type, which, childType, null, null, parseFloat(val));
						});
						break;

					case adhoc.nodeWhich.LITERAL_STRNG:
						// Prompt for a string value
						adhoc.promptValue('Enter a string:', adhoc.validateString, false, function(val){
							adhoc.createNode(prnt, repl, type, which, childType, null, null, val);
						});
						break;

					case adhoc.nodeWhich.LITERAL_ARRAY:
					case adhoc.nodeWhich.LITERAL_HASH:
					case adhoc.nodeWhich.LITERAL_STRCT:
// TODO: Prompt for literal value
adhoc.createNode(prnt, repl, type, which, childType);
						break;

					default:
						adhoc.createNode(prnt, repl, type, which, childType);
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
					if(role.max!=null && adhoc.countChildrenOfType(prnt, role.childType) >= role.max) continue;

					// If we make it here, the child type is viable
					roleOptions.push(role.childType);
					roleOptionNames.push(adhoc.nodeChildTypeInfo[role.childType].label);
				}

				// Report errors if there are no roles available
				if(!roleOptions.length){
					var parentName = adhoc.nodeWhichNames[adhoc.nodeWhichIndices[prnt.which][0]][adhoc.nodeWhichIndices[prnt.which][1]][0];
					var childName = adhoc.nodeWhichNames[type][adhoc.nodeWhichIndices[which][1]][0];
					adhoc.error(someOk
						? "The parent node cannot hold any more children of this type."
						: "A '"+parentName+"' node cannot hold a '"+childName+"' node directly."
					);

				// If no errors, but only one option, then just use that
				}else if(roleOptions.length == 1){
					createNodeWithType(roleOptions[0]);

				// If multiple roles available, prompt for which role will be filled
				}else{
					adhoc.promptFlag('Select a role for the new node:', roleOptionNames, function(val){
						createNodeWithType(roleOptions[val]);
					});
				}
			}
		};
		var moveFunc = function(e){
			// If the canvas isn't moving, just return
			if(!adhoc.canvas.hasClassName('moving')) return;

			// Get the scaled location of the cursor
			var offset = adhoc.canvas.positionedOffset();
			var click = {
				x: (Event.pointerX(e) - offset.left + adhoc.display_x) / adhoc.display_scale
				,y: (Event.pointerY(e) - offset.top + adhoc.display_y) / adhoc.display_scale
			};

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
		adhoc.canvas.observe('mousedown', downFunc);
		adhoc.canvas.observe('touchstart', downFunc);
		adhoc.canvas.observe('mouseup', upFunc);
		adhoc.canvas.observe('touchend', upFunc);
		adhoc.canvas.observe('mousemove', moveFunc);
		adhoc.canvas.observe('touchmove', moveFunc);

		// Ready the zoom buttons
		$('zoomIn').observe('click', function(){
			adhoc.display_scale *= 1.2;
			adhoc.refreshRender();
		});
		$('zoomOut').observe('click', function(){
			adhoc.display_scale /= 1.2;
			adhoc.refreshRender();
		});

		// Open an existing project or start a new one
// TODO: Load an old project or initialize a new one with it's root action
adhoc.rootNode = adhoc.createNode(
	null
	,null
	,adhoc.nodeTypes.ACTION
	,adhoc.nodeWhich.ACTION_DEFIN
	,adhoc.nodeChildType.STATEMENT
	,'My Project'
	,'Print 99 Bottles'
	,null
);

		// Draw the initial canvas
		adhoc.refreshRender();
	}

	// Generate the next available node ID
	adhoc.nextId = function(){
		return ++adhoc.lastId;
	}
	// Create a new node with just a type and empty contents
	adhoc.createNode = function(p, r, t, w, c, k, n, v){
		// Set the type, which, and childType if they're not passed
		if(!t) t = adhoc.nodeTypes.TYPE_NULL;
		if(!w) w = adhoc.nodeWhich.WHICH_NULL;
		if(!c) c = adhoc.nodeChildType.CHILD_NULL;

		// Create the object with its params
		var newNode = {
			id: adhoc.nextId()
			,parent: p
			,scope: null
			,nodeType: t
			,which: w
			,childType: c
			,dataType: null
			,package: k
			,name: n
			,value: v
			,children: []
			,scopeVars: []
			,x: 0
			,y: 0
			,width: null
			,height: null
			,subTreeHeight: 100
		};

		// Assign to the parent if present
		if(p){
			// If there is a null node to replace, do so
			if(r){
				var replIndex = p.children.indexOf(r);
				p.children[replIndex] = newNode;
			}else{
				p.children.push(newNode);
			}

			// Assign this variable to the appropriate scope as well
			if(w == adhoc.nodeWhich.VARIABLE_ASIGN){
				var searchFunc = adhoc.genScopeSearch(p, true);
				if(!searchFunc(n).length){
					while(p.which != adhoc.nodeWhich.ACTION_DEFIN
							&& p.which != adhoc.nodeWhich.CONTROL_LOOP){
						p = p.parent;
					}
					p.scopeVars.push(newNode);
				}
			}
		}

		// Register actions for later use
		if(w == adhoc.nodeWhich.ACTION_DEFIN){
			adhoc.registeredActions.push(newNode);
		}

		// Give this node empty children as necessary (dbg mode)
		if(adhoc.dbg){
			var neededChildren = adhoc.nodeWhichChildren[t][adhoc.nodeWhichIndices[w][1]];
			for(var i=0; i<neededChildren.length; ++i){
				for(var j=0; j<neededChildren[i].min; ++j){
					adhoc.createNode(
						newNode
						,null
						,adhoc.nodeTypes.TYPE_NULL
						,adhoc.nodeWhich.WHICH_NULL
						,neededChildren[i].childType
					);
				}
			}
		}

		// Refresh the canvas with the new node
		if(t != adhoc.nodeTypes.TYPE_NULL){
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
		ctx.lineWidth = 6;
		ctx.font = "20px Arial";
		adhoc.subTreeHeightNode(adhoc.rootNode);
		adhoc.positionNode(adhoc.rootNode, 0);
		adhoc.renderNode(adhoc.rootNode);
	}

	// Recursively determine the display heights of each subtree
	adhoc.subTreeHeightNode = function(n){
		if(!n.children.length) return (n.subTreeHeight = (n.nodeType==adhoc.nodeTypes.GROUP ? 30 : 100));
		n.subTreeHeight = (n.nodeType==adhoc.nodeTypes.GROUP ? 30 : 0);
		for(var i=0; i<n.children.length; ++i){
			n.subTreeHeight += adhoc.subTreeHeightNode(n.children[i]);
		}
		return n.subTreeHeight;
	}
	// Recursively determine each node's display position
	adhoc.positionNode = function(n, d){
		var passed = d ? n.y : 0;
		n.x = d*200 + 100;
		n.y = n.subTreeHeight/2 + passed;
		for(var i=0; i<n.children.length; ++i){
			n.children[i].y = passed;
			passed += n.children[i].subTreeHeight;
			adhoc.positionNode(n.children[i], d+(n.nodeType==adhoc.nodeTypes.GROUP ? 0 : 1));
		}
	}

	// Recursively draw each node
	adhoc.renderNode = function(n){
		// Process the children recursively
		var c, maxWidth=30;
		for(var i=0; i<n.children.length; ++i){
			// Render one child
			c = n.children[i];
			adhoc.renderNode(c);
			if(c.width > maxWidth) maxWidth = c.width;
		}

		var ctx = adhoc.canvas.getContext('2d');
		var nodeColor;
		ctx.lineWidth = (6.0*adhoc.display_scale)<<0;
		ctx.font = ((20.0*adhoc.display_scale)<<0)+'px Arial';
		ctx.fillStyle = adhoc.textColor;

		switch(n.nodeType){
		case adhoc.nodeTypes.TYPE_NULL:
			nodeColor = '#A0A0A0';
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
			ctx.setLineDash([10*adhoc.display_scale, 7*adhoc.display_scale]);
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
			ctx.fillStyle = '#FF8700';
			switch(n.which){
			case adhoc.nodeWhich.LITERAL_BOOL:
				// Get label text and its size
				var title = (n.value ? "true" : "false");
				var size = ctx.measureText(title);
				size.height = 20;
				n.width = size.width + 30;
				n.height = size.height + 50;

				// Print label text
				ctx.fillText(
					title
					,(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0)-3) * adhoc.display_scale - adhoc.display_y
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
				n.height = size.height + 50;

				// Print label text
				ctx.fillText(
					title
					,(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0)-3) * adhoc.display_scale - adhoc.display_y
				); 
				break;

			case adhoc.nodeWhich.LITERAL_ARRAY:
				// Determine the color for the brackets
				nodeColor = '#000000';

				// Set the node's dimensions
				n.width = 100;
				n.height = 100;

				// Darw the items
// TODO: draw shorthand for array items

				// Draw the brackets
				ctx.strokeStyle = nodeColor;
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

				ctx.strokeStyle = nodeColor;
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

		// Process the children recursively
		for(var i=0; i<n.children.length; ++i){
			// Draw a connecting arrow except for groups
			if(n.nodeType == adhoc.nodeTypes.GROUP) continue;
			c = n.children[i];
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
if(true || adhoc.dbg || childInfo.useLabel){
				var rise = arrowTo[1] - arrowFrom[1];
				var run = arrowTo[0] - arrowFrom[0];
				ctx.save();
				ctx.translate(arrowCenter[0], arrowCenter[1]);
				ctx.rotate(Math.atan(rise/run));
				ctx.textAlign = "center";
				ctx.fillStyle = nodeColor;
				ctx.fillText(childInfo.label, 0, 0);
				ctx.restore();
			}
		}
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
							,display: n
							,reminder: myScope.name
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
	// Generate a function to find actions by name
	adhoc.actionSearch = function(part){
		// Create an empty list of actions to return
		var out = [];

		// Search registered actions first
		for(var i=0; i<adhoc.registeredActions.length; ++i){
			// If one matches, add it to the output array
			var n = adhoc.registeredActions[i].name;
			if(n.indexOf(part)===0){
				out.push({
					value: n
					,display: n
					,reminder: adhoc.registeredActions[i].package
				});
			}
		}

		// Then search system actions
		for(var i=0; i<adhoc.systemActions.length; ++i){
			// If one matches, add it to the output array
			var n = adhoc.systemActions[i].name;
			if(n.indexOf(part)===0){
				out.push({
					value: n
					,display: n
					,reminder: 'system'
				});
			}
		}

		// Return the final list
		return out;
	}
	// Check how many children of a particular type some parent has
	adhoc.countChildrenOfType = function(prnt, childType){
		var count = 0;
		for(var i=0; i<prnt.children.length; ++i){
			if(prnt.children[i].childType == childType) ++count;
		}
		return count;
	}

	// Initialize the application
	adhoc.init();
});
