def stratify(a,b, every=3):
	output = []

	a_index = 0
	b_index = 0

	while a_index < len(a) or b_index < len(b):
		if b_index >= len(b) or (a_index < len(a) and (a_index + b_index) % every == 0):
			output.append(a[a_index])
			a_index += 1
		else:
			output.append(b[b_index])
			b_index += 1

	return output