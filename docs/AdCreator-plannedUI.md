<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Ad Creation Workflow</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
<script>
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            primary: "#134937",
            "background-light": "#F3F4F6","background-dark": "#111827",},
          fontFamily: {
            display: ["Inter", "sans-serif"],
          },
          borderRadius: {
            DEFAULT: "8px",
          },
        },
      },
    };
  </script>
<style>
    .material-symbols-outlined {
      font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 20
    }
  </style>
</head>
<body class="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 p-4 sm:p-6 md:p-8">
<div class="max-w-7xl mx-auto">
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
<div class="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
<div class="p-6 flex-grow">
<div class="flex flex-col sm:flex-row gap-4 mb-6">
<button class="flex-1 bg-primary text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
<span class="material-symbols-outlined">upload</span>
              Upload creatives
            </button>
<div class="flex-1 relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">search</span>
<input class="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 border-transparent focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Search" type="text"/>
</div>
</div>
<div class="space-y-4">
<label class="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
<input class="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" type="checkbox"/>
<span>Select all</span>
</label>
<div class="flex items-center space-x-4 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
<input checked="" class="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" type="checkbox"/>
<div class="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
<span class="material-symbols-outlined text-gray-500">image</span>
</div>
<div class="flex-grow">
<p class="font-medium text-gray-800 dark:text-gray-200">Creative 1</p>
<div class="flex items-center text-gray-500 dark:text-gray-400 text-sm gap-2">
<span class="material-symbols-outlined text-base">visibility</span>
<span class="material-symbols-outlined text-base">bar_chart</span>
<span class="material-symbols-outlined text-base">forum</span>
</div>
</div>
</div>
<div class="flex items-center space-x-4 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
<input checked="" class="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" type="checkbox"/>
<div class="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
<span class="material-symbols-outlined text-gray-500">image</span>
</div>
<div class="flex-grow">
<p class="font-medium text-gray-800 dark:text-gray-200">Creative 2</p>
<div class="flex items-center text-gray-500 dark:text-gray-400 text-sm gap-2">
<span class="material-symbols-outlined text-base">visibility</span>
<span class="material-symbols-outlined text-base">bar_chart</span>
<span class="material-symbols-outlined text-base">forum</span>
</div>
</div>
</div>
<div class="flex items-center space-x-4 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
<input checked="" class="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" type="checkbox"/>
<div class="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
<span class="material-symbols-outlined text-gray-500">image</span>
</div>
<div class="flex-grow">
<p class="font-medium text-gray-800 dark:text-gray-200">Creative 3</p>
<div class="flex items-center text-gray-500 dark:text-gray-400 text-sm gap-2">
<span class="material-symbols-outlined text-base">visibility</span>
<span class="material-symbols-outlined text-base">bar_chart</span>
<span class="material-symbols-outlined text-base">forum</span>
</div>
</div>
</div>
</div>
</div>
<div class="p-6 border-t border-gray-200 dark:border-gray-700 mt-auto">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-primary">looks_one</span>
<span class="font-semibold text-gray-900 dark:text-white">Step 1</span>
<span class="text-gray-600 dark:text-gray-300">Add creatives</span>
</div>
</div>
</div>
<div class="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
<div class="p-6 flex-grow">
<div class="relative mb-6">
<select class="w-full py-2 pl-4 pr-10 rounded-lg bg-gray-200 dark:bg-gray-700 border-transparent focus:ring-2 focus:ring-primary focus:border-transparent appearance-none">
<option>Ad Account: ScaleTrack</option>
<option>Ad Account: Another One</option>
</select>
<span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">expand_more</span>
</div>
<div class="space-y-4">
<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Ad copy:</p>
<div class="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
<p class="text-gray-800 dark:text-gray-200">Track. Launch. Scale. - all in one tool.</p>
<div class="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
<button class="hover:text-primary"><span class="material-symbols-outlined text-base">add_circle</span></button>
<button class="hover:text-primary"><span class="material-symbols-outlined text-base">content_copy</span></button>
<button class="hover:text-primary"><span class="material-symbols-outlined text-base">folder</span></button>
</div>
</div>
<div class="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
<p class="text-gray-800 dark:text-gray-200">Automate your ad workflow</p>
<div class="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
<button class="hover:text-primary"><span class="material-symbols-outlined text-base">add_circle</span></button>
<button class="hover:text-primary"><span class="material-symbols-outlined text-base">content_copy</span></button>
<button class="hover:text-primary"><span class="material-symbols-outlined text-base">folder</span></button>
</div>
</div>
<div class="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
<p class="text-gray-800 dark:text-gray-200">Save hours every week with ScaleTrack</p>
<div class="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
<button class="hover:text-primary"><span class="material-symbols-outlined text-base">add_circle</span></button>
<button class="hover:text-primary"><span class="material-symbols-outlined text-base">content_copy</span></button>
<button class="hover:text-primary"><span class="material-symbols-outlined text-base">folder</span></button>
</div>
</div>
<div class="relative">
<select class="w-full py-2 pl-4 pr-10 rounded-lg bg-gray-200 dark:bg-gray-700 border-transparent focus:ring-2 focus:ring-primary focus:border-transparent appearance-none">
<option>Start free trial</option>
<option>Learn more</option>
</select>
<span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">expand_more</span>
</div>
</div>
<div class="mt-8 space-y-4">
<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Set up your tracking:</p>
<div class="relative">
<select class="w-full py-2 pl-4 pr-10 rounded-lg bg-gray-200 dark:bg-gray-700 border-transparent focus:ring-2 focus:ring-primary focus:border-transparent appearance-none">
<option>New tracking campaign</option>
<option>Existing campaign</option>
</select>
<span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">expand_more</span>
</div>
</div>
</div>
<div class="p-6 border-t border-gray-200 dark:border-gray-700 mt-auto">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-primary">looks_two</span>
<span class="font-semibold text-gray-900 dark:text-white">Step 2</span>
<span class="text-gray-600 dark:text-gray-300">Set ad copy &amp; tracking</span>
</div>
</div>
</div>
<div class="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
<div class="p-6 flex-grow">
<div class="flex flex-col sm:flex-row gap-4 mb-6">
<div class="flex-1 relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">search</span>
<input class="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 border-transparent focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Search" type="text"/>
</div>
<button class="flex-1 bg-primary text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              Save &amp; Publish
            </button>
</div>
<div class="space-y-4">
<label class="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
<input checked="" class="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" type="checkbox"/>
<span>Create new campaign</span>
</label>
<div class="pl-8">
<label class="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
<input class="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" type="checkbox"/>
<span>New ad set name 1</span>
</label>
</div>
</div>
<div class="mt-8 space-y-4">
<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Old campaigns:</p>
<label class="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
<input checked="" class="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" type="checkbox"/>
<span class="h-2 w-2 rounded-full bg-green-500"></span>
<span>10039 - US - EnergyBooster</span>
</label>
<label class="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
<input checked="" class="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" type="checkbox"/>
<span class="h-2 w-2 rounded-full bg-yellow-500"></span>
<span>10038 - US - AniAging</span>
</label>
<label class="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
<input checked="" class="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" type="checkbox"/>
<span class="h-2 w-2 rounded-full bg-red-500"></span>
<span>10037 - US - JetLag</span>
</label>
</div>
</div>
<div class="p-6 border-t border-gray-200 dark:border-gray-700 mt-auto">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-primary">looks_3</span>
<span class="font-semibold text-gray-900 dark:text-white">Step 3</span>
<span class="text-gray-600 dark:text-gray-300">Publish into ad account</span>
</div>
</div>
</div>
</div>
</div>

</body></html>