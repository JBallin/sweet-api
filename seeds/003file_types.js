exports.seed = knex => (
  knex('file_types').del()
    .then(() => knex('file_types').insert([
      {
        title: 'bash_profile',
        extension: '.sh',
        category_id: 1,
      },
      {
        title: 'zshrc',
        extension: '.sh',
        category_id: 1,
      },
      {
        title: 'profile',
        extension: '.sh',
        category_id: 1,
      },
      {
        title: 'bashrc',
        extension: '.sh',
        category_id: 1,
      },
      {
        title: 'bash_completions',
        category_id: 1,
      },
      {
        title: 'brew_list',
        category_id: 2,
      },
      {
        title: 'brew_leaves',
        category_id: 2,
      },
      {
        title: 'brew_cask',
        category_id: 2,
      },
      {
        title: 'brew_services',
        category_id: 2,
      },
      {
        title: 'gitignore_global',
        category_id: 3,
      },
      {
        title: 'gitconfig',
        category_id: 3,
      },
      {
        title: 'npm_global',
        category_id: 4,
      },
      {
        title: 'nvmrc',
        category_id: 4,
      },
      {
        title: 'apm',
        category_id: 5,
      },
      {
        title: 'atom_config',
        extension: '.cson',
        category_id: 5,
      },
      {
        title: 'atom_keymap',
        extension: '.cson',
        category_id: 5,
      },
      {
        title: 'atom_snippets',
        extension: '.cson',
        category_id: 5,
      },
      {
        title: 'atom_styles',
        extension: '.less',
        category_id: 5,
      },
      {
        title: 'atom_init',
        extension: '.coffee',
        category_id: 5,
      },
      {
        title: 'vs_settings',
        extension: '.json',
        category_id: 6,
      },
      {
        title: 'vs_extensions',
        category_id: 6,
      },
      {
        title: 'brackets_settings',
        extension: '.json',
        category_id: 6,
      },
      {
        title: 'brackets_keymap',
        extension: '.json',
        category_id: 6,
      },
      {
        title: 'brackets_extensions',
        category_id: 6,
      },
      {
        title: 'brackets_disabled_extensions',
        extension: '.json',
        category_id: 6,
      },
      {
        title: 'vimrc',
        category_id: 7,
      },
      {
        title: 'nanorc',
        category_id: 7,
      },
    ]))
);
