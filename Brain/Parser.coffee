###
	2011- 2014 João Cardoso (jaliborc.com)
###

# Character Object
class Char
	constructor: (@parser, i) ->
		@text = @parser.formula.charAt(i)
		@type = @getType()
		this[@type] = true
		
		@operable = @oper or @no
		@priority = Operators[@text].priority if @operable
		@list = @parser.list
		@i = @list.length
			
	getType: ->	
		if @text == ' ' or @text == ''
			'ignore'
		else if @text == '('
			'open'
		else if @text == ')'
			'close'
		else if @text == NOT
			'no'
		else if Operators[@text]
			'oper'
		else if 65 <= @text.charCodeAt(0) <= 122
			'var'
		else
			'unkown'
		
	getValue: (x) ->
		if @value(x) then 'T' else 'F'
		
	value: (x) ->
		if @data then @data.values[x] else Operators[@text].value(@a.value(x), @b?.value(x))
		
	index: ->
		if @data then @data.i else @i + @parser.numVars + 1


# Parser
class Parser
	errors =
		var:
			var: 'TWO VAR'
			close: 'MISS OPER'
		oper:
			oper: 'TWO OPER'
			open: 'MISS VAR'
			none: 'MISS VAR'
			no: 'TWO OPER'
		open:
			var: 'MISS OPER'
			close: 'MISS OPER'
		close:
			no: 'MISS VAR'
			oper: 'MISS VAR'
			open: 'EMPTY BRACKET'
		no:
			var: 'MISS OPER'
			
	constructor: (@formula) ->
		return console.log(@error, @i) if @error = @parseFormula()	
		@result = ''
		@writeVars()
		@calculateSize()
		@writeFormula()
		@connectOpers()
		
	parseFormula: ->	
		@numOpers = 0
		@list = []
		@vars = {}
		
		last = false
		brackets = 0
		
		for i in [0 .. @formula.length - 1]
			char = new Char(this, i)
			continue if char.ignore
			
			@i = i
			return error if error = errors[char.type]?[last?.type or 'none']
			
			if char.var
				@vars[char.text] or= {values: []}
				char.data = @vars[char.text]
			else if char.operable
				@numOpers++
			else if char.open
				brackets++
			else if char.close
				brackets--
				return 'NUM BRACKETS' if brackets < 0
				
			@list.push(char)
			last = char
		
		@size = @list.length
		if @size is 0
			return 'EMPTY'
		else if @size < 2
			return 'SHORT'

		return 'MISS VAR' if last.type is 'oper' or last.type is 'no'
		return 'NUM BRACKETS' if brackets != 0
	
	
	# Writting	
	writeVars: ->
		vars = (id for id of @vars)
		@numVars = vars.length
		@lines = pow(2, @numVars) - 1
		
		for x in [0 .. @numVars - 1]
			id = vars[x]
			record = @vars[id]
			record.i = x
			@startCell(id)

			for y in [0 .. @lines]
				v = 1 - floor(y / pow(2, x)) % 2
				@result += @createBolean(v)
				record.values[y] = v

			@endCell()
			
	calculateSize: ->
		@formulaWidth = @numOpers * 17 + @size * 13
		@varsWidth = @numVars * 43
		
		@width = Math.max(1000, @varsWidth + @formulaWidth)
		@spacer = (@width - @varsWidth) / 2 + 'px'
		@width += 'px'
		
	writeFormula: ->
		@result += '<div class="cell">'
		@createSpacer()
		
		for i, char of @list
				@startCell(char.text)
				
				for y in [0 .. @lines]
					input =if char.operable then @createInput(i) else ''
					@result += '<li>' +  input + '</li>'
				
				@endCell()
		
		@createSpacer()
		@result += '</div>'
		
	createSpacer: ->
		@result += '<div class="cell spacer" style="width:' + @spacer + '"><h1>.</h1><ul>'
		@result += '<li>.</li>'.times(@lines + 1)
		@endCell()
		
	startCell: (header) ->
		@result += '<div class="cell"><h1>' + header + '</h1><ul>'

	createInput: (oper) ->
		'<input oninput="parseInput(this)" onfocus="focusRelations(this)" onblur="clearRelations()" oper="' + oper + '">'

	createBolean: (n) ->
		if n == 1 then T else F

	endCell: ->
		@result += '</ul></div>'
	
	
	# Connections		
	connectOpers: ->
		for i in [0 .. @size - 1]
			char = @list[i]
			continue unless char.operable
			
			char.b = @getConnection(char, i, -1, 'close', 'open') if not char.no
			char.a = @getConnection(char, i, 1, 'open', 'close')
			
	getConnection: (char, start, order, bracket, lose) ->
		start += order
		prio = char.priority + order
		target = @list[start]
		brackets = 0
		i = start

		while target
			if target[lose]
				break
			else if target[bracket]
				brackets++
			else if target.oper
				return target if brackets == 1 or target.priority > prio
				brackets--
			else if target.no
				return target if brackets == 0
				
			i += order
			target = @list[i]

		return @list[start]