def stratify(a,b, every=3):
	output = []
	total_length = len(a) + len(b)

	for i in range(total_length):
		if i % every == 0 and i // every < len(a):
			output.append(a[i // every])
		else:
			output.append(b[i // every + i % every])
	return output